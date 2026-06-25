import hashlib
import re
import secrets
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.annotations.models import AnnotationObject, SceneGraphRelationship
from apps.assets.models import Asset
from apps.taxonomy.models import ProjectAttribute, ProjectClass, ProjectPredicate

from .models import Dataset, DatasetAPIKey, DatasetMember, DatasetVersion


User = get_user_model()


def auto_generate_version_tag(*, dataset: Dataset) -> str:
    """
    Bir dataset için otomatik version_tag üretir.
    İlk versiyon "v1.0", sonrakiler "v2.0", "v3.0" şeklinde devam eder.
    """
    latest_version = (
        DatasetVersion.objects.filter(dataset=dataset)
        .order_by("-created_at")
        .first()
    )
    if latest_version is None:
        return "v1.0"

    # Mevcut tag'i parse et (v1.0, v2.0, v1.5, etc.)
    match = re.match(r"v?(\d+)\.?(\d+)?", latest_version.version_tag)
    if match:
        major = int(match.group(1))
        return f"v{major + 1}.0"

    return "v2.0"


def create_dataset(
    *,
    project,
    created_by,
    name: str,
    description: str = "",
) -> Dataset:
    dataset = Dataset.objects.create(
        project=project,
        created_by=created_by,
        name=name,
        description=description,
    )

        # Sadece proje sahibi (owner) otomatik olarak admin rolüyle eklenir.
    # Diğer proje üyeleri admin tarafından manuel olarak eklenmelidir.
    DatasetMember.objects.create(
        dataset=dataset,
        user=project.owner,
        role=DatasetMember.Role.ADMIN,
    )

    # Otomatik v1.0 versiyonu oluştur
    create_dataset_version(
        dataset=dataset,
        created_by=created_by,
        version_tag="v1.0",
        description=f"Initial version of {name}",
    )

    return dataset


def update_dataset(
    *,
    dataset: Dataset,
    name: str | None = None,
    description: str | None = None,
) -> Dataset:
    update_fields = []

    if name is not None:
        dataset.name = name
        update_fields.append("name")

    if description is not None:
        dataset.description = description
        update_fields.append("description")

    if update_fields:
        update_fields.append("updated_at")
        dataset.save(update_fields=update_fields)

    return dataset


def delete_dataset(*, dataset: Dataset):
    dataset.is_deleted = True
    dataset.save(update_fields=["is_deleted", "updated_at"])


def add_or_update_dataset_member(
    *,
    dataset: Dataset,
    username: str,
    role: str,
) -> DatasetMember:
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        raise ValidationError("User with this username does not exist.")

    # Kullanıcı önce proje üyesi olmalıdır
    from apps.projects.models import ProjectMembership

    if not ProjectMembership.objects.filter(
        project=dataset.project,
        user=user,
    ).exists() and dataset.project.owner_id != user.id:
        raise ValidationError(
            "User must be a project member before being added to a dataset. "
            "Add them to the project first."
        )

    membership, created = DatasetMember.objects.get_or_create(
        dataset=dataset,
        user=user,
        defaults={"role": role},
    )

    if not created:
        membership.role = role
        membership.save(update_fields=["role"])

    return membership


def update_dataset_member_role(
    *,
    membership: DatasetMember,
    role: str,
) -> DatasetMember:
    membership.role = role
    membership.save(update_fields=["role"])
    return membership


def remove_dataset_member(*, membership: DatasetMember):
    membership.delete()

def build_dataset_snapshot(*, dataset: Dataset) -> dict:
    project = dataset.project

    classes = ProjectClass.objects.filter(project=project).order_by("index", "name")
    predicates = ProjectPredicate.objects.filter(project=project).order_by("name")
    attributes = ProjectAttribute.objects.filter(project=project).order_by("name")

    assets = (
        Asset.objects.filter(
            dataset=dataset,
            is_deleted=False,
            status=Asset.UploadStatus.UPLOADED,
        )
        .order_by("created_at")
    )

    asset_snapshots = []

    for asset in assets:
        objects = AnnotationObject.objects.filter(image=asset).select_related(
            "annotation_class"
        )

        relationships = SceneGraphRelationship.objects.filter(
            image=asset,
        ).select_related(
            "subject",
            "object",
            "predicate",
        )

        asset_snapshots.append(
            {
                "asset_id": str(asset.id),
                "filename": asset.filename,
                "mime_type": asset.mime_type,
                "width": asset.width,
                "height": asset.height,
                "storage_key": asset.storage_key,
                "objects": [
                    {
                        "id": str(obj.id),
                        "class_id": str(obj.annotation_class_id),
                        "class_name": obj.annotation_class.name,
                        "type": obj.geometry_type,
                        "coordinates": obj.coordinates,
                    }
                    for obj in objects
                ],
                "relationships": [
                    {
                        "id": str(rel.id),
                        "subject_id": str(rel.subject_id),
                        "object_id": str(rel.object_id),
                        "predicate_id": str(rel.predicate_id),
                        "predicate": rel.predicate.name,
                    }
                    for rel in relationships
                ],
            }
        )

    return {
        "dataset": {
            "id": str(dataset.id),
            "name": dataset.name,
            "description": dataset.description,
            "project_id": str(project.id),
            "project_name": project.name,
        },
        "taxonomy": {
            "classes": [
                {
                    "id": str(item.id),
                    "name": item.name,
                    "color": item.color,
                    "index": item.index,
                    "is_active": item.is_active,
                    "include_in_export": item.include_in_export,
                }
                for item in classes
            ],
            "predicates": [
                {
                    "id": str(item.id),
                    "name": item.name,
                    "is_active": item.is_active,
                    "include_in_export": item.include_in_export,
                }
                for item in predicates
            ],
            "attributes": [
                {
                    "id": str(item.id),
                    "name": item.name,
                    "attribute_type": item.attribute_type,
                    "options": item.options,
                    "is_active": item.is_active,
                    "include_in_export": item.include_in_export,
                }
                for item in attributes
            ],
        },
        "assets": asset_snapshots,
    }

def create_dataset_version(
    *,
    dataset: Dataset,
    created_by,
    version_tag: str,
    description: str = "",
) -> DatasetVersion:
    if DatasetVersion.objects.filter(
        dataset=dataset,
        version_tag=version_tag,
    ).exists():
        raise ValidationError("A version with this tag already exists for this dataset.")

    snapshot = build_dataset_snapshot(dataset=dataset)

    return DatasetVersion.objects.create(
        dataset=dataset,
        version_tag=version_tag,
        description=description or "",
        snapshot=snapshot,
        created_by=created_by,
    )

def delete_dataset_version(*, version: DatasetVersion):
    version.delete()


def restore_dataset_version(
    *,
    source_version: DatasetVersion,
    created_by,
    mode: str = "create_new",
) -> DatasetVersion:
    """
    Bir versiyonun snapshot'ını geri yükler.

    İki mod:
    - 'create_new': Snapshot'taki verilerle yeni bir versiyon oluşturur.
                    Mevcut dataset state'i korunur.
    - 'replace': Snapshot'taki verileri mevcut dataset'in asset/annotation
                 state'ine kopyalar. Mevcut asset ve annotation'lar silinir.
    """
    dataset = source_version.dataset
    snapshot = source_version.snapshot

    if mode == "create_new":
        version_tag = auto_generate_version_tag(dataset=dataset)
        return create_dataset_version(
            dataset=dataset,
            created_by=created_by,
            version_tag=version_tag,
            description=f"Restored from {source_version.version_tag}",
        )

    elif mode == "replace":
        # Mevcut asset ve annotation'ları temizle
        assets = Asset.objects.filter(
            dataset=dataset,
            is_deleted=False,
        )
        for asset in assets:
            # AnnotationObject'ları sil (SceneGraphRelationship'ler cascade ile otomatik silinir)
            asset.annotation_objects.all().delete()
            # SceneGraphRelationship'leri doğrudan asset üzerinden temizle
            SceneGraphRelationship.objects.filter(image=asset).delete()
            asset.is_deleted = True
            asset.save(update_fields=["is_deleted"])

        # Snapshot'taki asset'leri yeniden oluştur
        # Not: Bu modda sadece dataset'in state'i değişir.
        # Gerçek asset dosyaları (storage_key) korunur.

        # Yeni bir versiyon oluştur (replace sonrası state'i freeze'lemek için)
        version_tag = auto_generate_version_tag(dataset=dataset)
        dataset.name = snapshot.get("dataset", {}).get("name", dataset.name)
        dataset.description = snapshot.get("dataset", {}).get("description", dataset.description)
        dataset.save(update_fields=["name", "description", "updated_at"])

        return create_dataset_version(
            dataset=dataset,
            created_by=created_by,
            version_tag=version_tag,
            description=f"Replaced state from {source_version.version_tag}",
        )

    else:
        raise ValidationError(f"Unknown restore mode: {mode}")

def _hash_api_key(raw_key: str) -> str:
    return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()


def _generate_dataset_api_key() -> str:
    return f"cdat_{secrets.token_urlsafe(32)}"


def create_dataset_api_key(
    *,
    dataset: Dataset,
    created_by,
    name: str,
    ttl_days: int | None = None,
    target_version: str | None = None,
):
    if target_version and not DatasetVersion.objects.filter(
        dataset=dataset,
        version_tag=target_version,
    ).exists():
        raise ValidationError(
            "The target version does not exist in this dataset."
        )

    raw_key = _generate_dataset_api_key()
    key_prefix = raw_key[:16]
    hashed_key = _hash_api_key(raw_key)

    api_key = DatasetAPIKey.objects.create(
        dataset=dataset,
        name=name,
        key_prefix=key_prefix,
        hashed_key=hashed_key,
        created_by=created_by,
        is_active=True,
        target_version=target_version,
        expires_at=(
            timezone.now() + timedelta(days=ttl_days)
            if ttl_days is not None
            else None
        ),
    )

    return api_key, raw_key


def update_dataset_api_key(
    *,
    api_key: DatasetAPIKey,
    data: dict,
) -> DatasetAPIKey:
    update_fields = []

    if "name" in data:
        api_key.name = data["name"]
        update_fields.append("name")

    if "is_active" in data:
        api_key.is_active = data["is_active"]
        update_fields.append("is_active")

        if data["is_active"] is False and api_key.revoked_at is None:
            api_key.revoked_at = timezone.now()
            update_fields.append("revoked_at")

        if data["is_active"] is True:
            api_key.revoked_at = None
            update_fields.append("revoked_at")

    if "ttl_days" in data:
        api_key.expires_at = timezone.now() + timedelta(
            days=data["ttl_days"]
        )
        update_fields.append("expires_at")

    if update_fields:
        api_key.save(update_fields=update_fields)

    return api_key


def revoke_dataset_api_key(*, api_key: DatasetAPIKey) -> DatasetAPIKey:
    api_key.is_active = False
    api_key.revoked_at = timezone.now()
    api_key.save(update_fields=["is_active", "revoked_at"])

    return api_key


def revoke_all_dataset_api_keys(*, dataset: Dataset) -> int:
    now = timezone.now()

    updated_count = DatasetAPIKey.objects.filter(
        dataset=dataset,
        is_active=True,
    ).update(
        is_active=False,
        revoked_at=now,
    )

    return updated_count
