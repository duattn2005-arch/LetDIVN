#!/usr/bin/env python3
"""Giải nén file .wpress (All-in-One WP Migration). Chỉ ghi file ra đĩa, KHÔNG chạy file nào.

Định dạng: lặp lại [header 4377 byte][nội dung]; header = tên 255B + size 14B + mtime 12B + path 4096B
(chuỗi đệm \\0). Khối header toàn \\0 đánh dấu hết file.

Dùng:  python -I wpress_extract.py <file.wpress> [thu_muc_dich]   (mặc định ./site)
       python -I wpress_extract.py <file.wpress> --list           (chỉ liệt kê, không ghi)
"""
import os
import sys

NAME, SIZE, MTIME, PATH = 255, 14, 12, 4096
HDR = NAME + SIZE + MTIME + PATH  # 4377
CHUNK = 1 << 20


def _field(raw):
    return raw.split(b"\0", 1)[0].decode("utf-8", "replace")


def read_headers(f):
    """Sinh (đường_dẫn_tương_đối, size, mtime) cho từng file; con trỏ f đứng ở đầu nội dung."""
    while True:
        h = f.read(HDR)
        # Hết file: khối toàn \0 (bản cũ) hoặc khối tên rỗng chứa tổng dung lượng (bản mới)
        if len(h) < HDR or not h[:NAME].strip(b"\0"):
            return
        size_s, mtime_s = _field(h[NAME:NAME + SIZE]), _field(h[NAME + SIZE:NAME + SIZE + MTIME])
        if not size_s.isdigit():
            raise ValueError("Header hỏng tại byte %d (size=%r)" % (f.tell() - HDR, size_s))
        prefix = _field(h[NAME + SIZE + MTIME:]).replace("\\", "/")
        rel = "/".join(p for p in (prefix + "/" + _field(h[:NAME]).replace("\\", "/")).split("/") if p not in ("", "."))
        yield rel, int(size_s), int(mtime_s) if mtime_s.isdigit() else 0


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 2
    src = argv[1]
    list_only = "--list" in argv[2:]
    dest = next((a for a in argv[2:] if a != "--list"), "site")
    root = os.path.realpath(dest)
    count = total = 0
    with open(src, "rb") as f:
        for rel, size, mtime in read_headers(f):
            count += 1
            total += size
            if list_only:
                print("%12d  %s" % (size, rel))
                f.seek(size, 1)
                continue
            out = os.path.realpath(os.path.join(root, rel))
            # Chặn path traversal ("../") trong archive độc hại
            if not out.startswith(root + os.sep):
                print("BỎ QUA (đường dẫn nguy hiểm):", rel, file=sys.stderr)
                f.seek(size, 1)
                continue
            os.makedirs(os.path.dirname(out), exist_ok=True)
            start = f.tell()
            try:
                with open(out, "wb") as o:
                    left = size
                    while left:
                        buf = f.read(min(CHUNK, left))
                        if not buf:
                            raise ValueError("File .wpress bị cắt cụt tại: " + rel)
                        o.write(buf)
                        left -= len(buf)
                if mtime:
                    os.utime(out, (mtime, mtime))  # giữ ngày sửa gốc trên server để lọc theo tháng
            except OSError as e:
                # Antivirus có thể chặn ghi webshell: ghi lại rồi đi tiếp
                print("KHÔNG GHI ĐƯỢC (có thể antivirus chặn → nghi mã độc): %s (%s)" % (rel, e), file=sys.stderr)
                f.seek(start + size)
    print("%d file, %.1f MB%s" % (count, total / 1048576, "" if list_only else " -> " + root))
    return 0


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # console Windows
    sys.exit(main(sys.argv))
