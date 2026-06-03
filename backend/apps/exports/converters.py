def bbox_to_yolo(*, bbox, image_width, image_height):
    """
    Input bbox: [x, y, w, h]
    Output YOLO: [center_x, center_y, width, height], normalized 0-1
    """
    x, y, w, h = bbox

    center_x = x + (w / 2)
    center_y = y + (h / 2)

    return [
        center_x / image_width,
        center_y / image_height,
        w / image_width,
        h / image_height,
    ]


def polygon_to_bbox(*, coordinates):
    """
    Input polygon: [x1, y1, x2, y2, ...]
    Output bbox: [x, y, w, h]
    """
    xs = coordinates[0::2]
    ys = coordinates[1::2]

    min_x = min(xs)
    min_y = min(ys)
    max_x = max(xs)
    max_y = max(ys)

    return [
        min_x,
        min_y,
        max_x - min_x,
        max_y - min_y,
    ]


def keypoints_to_bbox(*, coordinates):
    xs = coordinates[0::2]
    ys = coordinates[1::2]

    min_x = min(xs)
    min_y = min(ys)
    max_x = max(xs)
    max_y = max(ys)

    return [
        min_x,
        min_y,
        max_x - min_x,
        max_y - min_y,
    ]


def object_to_bbox(*, annotation_object):
    if annotation_object.geometry_type == "bbox":
        return annotation_object.coordinates

    if annotation_object.geometry_type == "polygon":
        return polygon_to_bbox(
            coordinates=annotation_object.coordinates,
        )

    if annotation_object.geometry_type == "keypoint":
        return keypoints_to_bbox(
            coordinates=annotation_object.coordinates,
        )

    return [0, 0, 0, 0]


def object_to_coco_segmentation(*, annotation_object):
    if annotation_object.geometry_type == "polygon":
        return [annotation_object.coordinates]

    return []


def bbox_area(*, bbox):
    return bbox[2] * bbox[3]

def polygon_area(*, coordinates):
    """
    Calculates polygon area using the shoelace formula.

    Input:
        coordinates = [x1, y1, x2, y2, x3, y3, ...]

    Output:
        area as float
    """
    if not coordinates or len(coordinates) < 6 or len(coordinates) % 2 != 0:
        return 0

    points = list(zip(coordinates[0::2], coordinates[1::2]))

    area = 0

    for index, (x1, y1) in enumerate(points):
        x2, y2 = points[(index + 1) % len(points)]
        area += (x1 * y2) - (x2 * y1)

    return abs(area) / 2


def object_to_coco_area(*, annotation_object):
    if annotation_object.geometry_type == "polygon":
        return polygon_area(
            coordinates=annotation_object.coordinates,
        )

    bbox = object_to_bbox(annotation_object=annotation_object)

    return bbox_area(bbox=bbox)


def snapshot_object_to_coco_area(*, snapshot_object):
    if snapshot_object.get("type") == "polygon":
        return polygon_area(
            coordinates=snapshot_object.get("coordinates", []),
        )

    geometry_type = snapshot_object.get("type")
    coordinates = snapshot_object.get("coordinates", [])

    if geometry_type == "bbox":
        bbox = coordinates
    elif geometry_type == "polygon":
        bbox = polygon_to_bbox(coordinates=coordinates)
    elif geometry_type == "keypoint":
        bbox = keypoints_to_bbox(coordinates=coordinates)
    else:
        bbox = [0, 0, 0, 0]

    return bbox_area(bbox=bbox)