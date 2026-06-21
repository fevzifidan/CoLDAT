import math


def validate_image_dimensions(*, image_width, image_height):
    if (
        not image_width
        or not image_height
        or image_width <= 0
        or image_height <= 0
    ):
        raise ValueError("Image width and height must be positive.")


def validate_geometry_coordinates(
    *,
    geometry_type: str,
    coordinates: list,
    image_width,
    image_height,
):
    validate_image_dimensions(
        image_width=image_width,
        image_height=image_height,
    )

    if not coordinates or not all(
        isinstance(value, (int, float)) and math.isfinite(value)
        for value in coordinates
    ):
        raise ValueError("Coordinates must contain only finite numbers.")

    if geometry_type == "bbox":
        if len(coordinates) != 4:
            raise ValueError("bbox coordinates must be [x, y, w, h].")

        x, y, width, height = coordinates
        if width <= 0 or height <= 0:
            raise ValueError("bbox width and height must be positive.")
        if (
            x < 0
            or y < 0
            or x + width > image_width
            or y + height > image_height
        ):
            raise ValueError("bbox coordinates must stay within the image bounds.")
        return

    if geometry_type == "polygon":
        if len(coordinates) < 6 or len(coordinates) % 2 != 0:
            raise ValueError("polygon coordinates must contain at least three x/y pairs.")
    elif geometry_type == "keypoint":
        if len(coordinates) < 2 or len(coordinates) % 2 != 0:
            raise ValueError("keypoint coordinates must contain x/y pairs.")
    else:
        raise ValueError("Invalid annotation geometry type.")

    for x, y in zip(coordinates[0::2], coordinates[1::2]):
        if x < 0 or y < 0 or x > image_width or y > image_height:
            raise ValueError(
                f"{geometry_type} coordinates must stay within the image bounds."
            )
