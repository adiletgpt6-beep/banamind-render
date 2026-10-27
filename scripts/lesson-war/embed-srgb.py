# Встраивает ICC-профиль sRGB (сегмент APP2 ICC_PROFILE) в JPEG без пересжатия.
#   python3 scripts/lesson-war/embed-srgb.py file.jpg [...]
import struct, sys
from PIL import ImageCms

icc = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()
seg = b"ICC_PROFILE\x00" + bytes([1, 1]) + icc
app2 = b"\xff\xe2" + struct.pack(">H", len(seg) + 2) + seg
for f in sys.argv[1:]:
    b = open(f, "rb").read()
    assert b[:2] == b"\xff\xd8", f
    if b"ICC_PROFILE" in b[:65536]:
        print("уже есть профиль:", f)
        continue
    open(f, "wb").write(b[:2] + app2 + b[2:])
    print("✓ sRGB:", f)
