#!/usr/bin/env python3
"""Quét mã độc tĩnh (chỉ ĐỌC file, không chạy gì) trên thư mục đã giải nén từ .wpress.

Dùng:  python -I scan_site.py <thu_muc_site> [bao_cao.md] [--month 2026-10]
Thư mục site có thể là gốc .wpress (plugins/, themes/, uploads/, mu-plugins/ nằm ngay dưới)
hoặc chứa wp-content/.
"""
import collections
import datetime
import os
import re
import sys

PHP_EXT = re.compile(r"\.(php\d?|phtml|pht|phar|phps|inc)$", re.I)
CFG_NAMES = {".htaccess", ".user.ini", "php.ini"}
HIDE_PHP_EXT = {".ico", ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp", ".svg", ".txt", ".log", ".woff", ".ttf"}
MAX_READ = 8 * 1024 * 1024

D, S = "Nguy hiểm", "Nghi ngờ"
# (mức độ, mô tả, regex, đề xuất)
RULES = [
    (D, "eval() chạy chuỗi giải mã / biến", r"\beval\s*\(\s*(base64_decode|gzinflate|gzuncompress|gzdecode|str_rot13|strrev|hex2bin|\$)", "Xoá/thay file gốc"),
    (D, "Chuỗi giải mã lồng nhau (gzinflate/str_rot13/base64)", r"(gzinflate|gzuncompress|gzdecode|str_rot13|strrev)\s*\(\s*(base64_decode|str_rot13|gzinflate|strrev)\s*\(", "Xoá/thay file gốc"),
    (D, "assert() với biến (chạy code tuỳ ý)", r"\bassert\s*\(\s*\$", "Xoá/thay file gốc"),
    (D, "create_function() (backdoor cổ điển, lỗi fatal trên PHP 8)", r"\bcreate_function\s*\(", "Thay bản chính hãng"),
    (D, "preg_replace với cờ /e", r"preg_replace\s*\(\s*['\"]([^\w\s\\])[^'\"]*\1[a-zA-Z]*e[a-zA-Z]*['\"]", "Xoá/thay file gốc"),
    (D, "Gọi hàm từ dữ liệu người dùng ($_GET/$_POST...)", r"\$_(GET|POST|REQUEST|COOKIE|SERVER)\s*\[[^\]]+\]\s*\(", "Xoá/thay file gốc"),
    (D, "Lệnh hệ thống nhận dữ liệu người dùng", r"\b(system|exec|shell_exec|passthru|popen|proc_open|pcntl_exec)\s*\([^;]{0,120}\$_(GET|POST|REQUEST|COOKIE|SERVER)", "Xoá/thay file gốc"),
    (D, "Ghi file .php", r"\b(file_put_contents|fwrite|fputs|fopen|move_uploaded_file|copy|rename)\s*\([^;]{0,200}\.php['\"]", "Kiểm tra tay; thường là dropper"),
    (D, "Gán quyền administrator", r"(set_role|add_role)\s*\(\s*['\"]administrator['\"]|['\"]role['\"]\s*=>\s*['\"]administrator['\"]", "Kiểm tra danh sách admin, xoá admin lạ"),
    (D, "Ẩn user khỏi wp-admin (pre_user_query)", r"['\"]pre_user_query['\"]", "Xoá/thay file gốc"),
    (D, "include file không phải PHP (ẩn code trong ảnh/ico)", r"\b(include|require)(_once)?\s*\(?\s*[^;]{0,80}\.(ico|png|jpe?g|gif|txt|log)['\"]", "Xoá/thay file gốc"),
    (D, "Chuỗi hex làm rối (\\x..)", r"(\\x[0-9a-fA-F]{2}){12,}", "Xem tay"),
    (D, "$GLOBALS bị làm rối", r"\$GLOBALS\s*\[\s*['\"][^'\"]{0,40}['\"]\s*\]\s*\[\s*\d+\s*\]\s*\(|\$GLOBALS\s*\[\s*['\"][\w]{0,3}['\"]\s*\.\s*", "Xoá/thay file gốc"),
    (S, "eval()", r"\beval\s*\(", "Xem ngữ cảnh"),
    (S, "base64_decode()", r"\bbase64_decode\s*\(", "Xem ngữ cảnh (thư viện hợp lệ cũng dùng)"),
    (S, "Lệnh hệ thống (exec/system/shell_exec/passthru/popen/proc_open)", r"\b(system|exec|shell_exec|passthru|popen|proc_open)\s*\(", "Xem ngữ cảnh"),
    (S, "Tạo user (wp_insert_user/wp_create_user)", r"\bwp_(insert|create)_user\s*\(", "Xem ngữ cảnh (WooCommerce dùng hợp lệ)"),
    (S, "Lọc danh sách plugin (all_plugins) — có thể ẩn plugin", r"['\"]all_plugins['\"]", "Xem ngữ cảnh (white-label hợp lệ cũng dùng)"),
    (S, "Chuỗi mã hoá rất dài", r"[A-Za-z0-9+/]{800,}={0,2}", "Xem tay"),
    (S, "Dấu hiệu bản nulled/crack", r"(?i)(nulled|babiato|gpldl|weadown|gplplus|wpnull|null24|codelist\.cc|gpltimes|activated by|license_key['\"]\s*,\s*['\"][A-Z0-9-]{8,})", "Thay bản chính hãng"),
    (S, "Kiểu backdoor @$_ / chr() nối chuỗi", r"@\$_(GET|POST|REQUEST|COOKIE)|(chr\(\d+\)\s*\.\s*){6,}", "Xem tay"),
]
RULES = [(lv, desc, re.compile(rx), fix) for lv, desc, rx, fix in RULES]

URL_RX = re.compile(r"https?://([a-z0-9][a-z0-9.-]*\.[a-z]{2,})", re.I)
REMOTE_RX = re.compile(r"\b(curl_init|curl_setopt|file_get_contents|wp_remote_(get|post|request)|fsockopen|stream_socket_client)\s*\(", re.I)
SAFE_DOMAINS = re.compile(r"(^|\.)(wordpress\.org|w\.org|wordpress\.com|wp\.com|gravatar\.com|github\.com|githubusercontent\.com|google\.com|googleapis\.com|gstatic\.com|youtube\.com|facebook\.com|twitter\.com|x\.com|schema\.org|w3\.org|php\.net|elementor\.com|wpastra\.com|brainstormforce\.com|premiumaddons\.com|leap13\.com|elegantthemes\.com|woocommerce\.com|woo\.com|yoast\.com|litespeedtech\.com|quic\.cloud|example\.(com|org)|jquery\.com|cloudflare\.com|jsdelivr\.net|unpkg\.com|mozilla\.org|microsoft\.com|apple\.com|paypal\.com|stripe\.com|vimeo\.com|instagram\.com|linkedin\.com|pinterest\.com|creativecommons\.org|opensource\.org|gnu\.org|fontawesome\.com|fonts\.com|polylang\.pro|updraftplus\.com|wpmailsmtp\.com|localhost)$", re.I)


def group_of(rel):
    p = rel.split("/")
    if p[0] in ("plugins", "themes") and len(p) > 2:
        return p[0] + "/" + p[1]
    return p[0]


def scan_text(rel, text, findings, domains):
    for lv, desc, rx, fix in RULES:
        hits = 0
        for m in rx.finditer(text):
            line = text.count("\n", 0, m.start()) + 1
            findings.append((lv, group_of(rel), rel, line, desc, fix))
            hits += 1
            if hits >= 3:  # tối đa 3 dòng / luật / file cho gọn
                break
    if REMOTE_RX.search(text):
        for m in URL_RX.finditer(text):
            d = m.group(1).lower().rstrip(".")
            if not SAFE_DOMAINS.search(d):
                domains[(group_of(rel), d)].add(rel)


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 2
    base = argv[1]
    if os.path.isdir(os.path.join(base, "wp-content")):
        base = os.path.join(base, "wp-content")
    out = next((a for a in argv[2:] if a.endswith(".md")), "bao_cao_quet.md")
    month = argv[argv.index("--month") + 1] if "--month" in argv else "2026-10"

    findings, domains = [], collections.defaultdict(set)
    recent, mtimes = [], collections.defaultdict(list)
    for top in ("mu-plugins", "plugins", "themes", "uploads"):
        root = os.path.join(base, top)
        for dirpath, _dirs, files in os.walk(root):
            for name in files:
                full = os.path.join(dirpath, name)
                rel = os.path.relpath(full, base).replace("\\", "/")
                low = name.lower()
                ext = os.path.splitext(low)[1]
                is_php = bool(PHP_EXT.search(low))
                mt = os.path.getmtime(full)
                mtimes[group_of(rel)].append(mt)
                if datetime.datetime.fromtimestamp(mt).strftime("%Y-%m") == month:
                    recent.append((mt, rel))

                # --- Vị trí bất thường ---
                if top == "mu-plugins":
                    findings.append((D if is_php else S, "mu-plugins", rel, "", "File trong mu-plugins (tự chạy, không tắt được từ wp-admin)", "Đối chiếu: nếu không do hosting/bạn tạo thì xoá"))
                if top == "uploads" and is_php:
                    findings.append((D, "uploads", rel, "", "File PHP trong uploads", "Xoá; chặn chạy PHP trong uploads"))
                if low in CFG_NAMES and top in ("uploads", "plugins", "themes") and rel.count("/") > 0:
                    findings.append((S, group_of(rel), rel, "", "File cấu hình máy chủ (%s) nằm sâu trong %s" % (name, top), "Đọc nội dung: có cho chạy PHP / redirect không"))
                parts = rel.lower().split("/")
                if is_php and top in ("plugins", "themes") and any(d in ("images", "img", "css", "fonts") for d in parts[:-1]):
                    findings.append((S, group_of(rel), rel, "", "File PHP nằm trong thư mục ảnh/css/fonts", "So với bản gốc"))
                if is_php and re.fullmatch(r"(?=[a-z0-9]*\d)(?=[a-z0-9]*[a-z])[a-z0-9]{7,}\.php", low) and not low.startswith(("class", "index")):
                    findings.append((S, group_of(rel), rel, "", "Tên file PHP trông ngẫu nhiên", "So với bản gốc"))

                # --- Nội dung ---
                if not (is_php or low in CFG_NAMES or ext in HIDE_PHP_EXT):
                    continue
                try:
                    with open(full, "rb") as f:
                        raw = f.read(MAX_READ)
                except OSError:
                    # Antivirus (Windows Defender) thường khoá/cách ly webshell -> chính là dấu hiệu
                    findings.append((D, group_of(rel), rel, "", "Không đọc được file (có thể antivirus đã chặn vì nhận diện mã độc)", "Xem lịch sử Windows Security"))
                    continue
                if not is_php and low not in CFG_NAMES:
                    # Chỉ báo khi sau thẻ PHP có lệnh nguy hiểm (font/ảnh nhị phân hay chứa "<?=" ngẫu nhiên)
                    if re.search(rb"<\?(php|=)[\s\S]{0,2000}?(eval|assert|system|exec|base64_decode|gzinflate|\$_(GET|POST|REQUEST|COOKIE))\s*[\(\[]", raw):
                        findings.append((D, group_of(rel), rel, "", "Code PHP giấu trong file %s" % ext, "Xoá"))
                    continue
                scan_text(rel, raw.decode("utf-8", "replace"), findings, domains)

    for (grp, dom), files in sorted(domains.items()):
        f = sorted(files)
        findings.append((S, grp, f[0] + (" (+%d file)" % (len(f) - 1) if len(f) > 1 else ""), "", "Kết nối mạng tới domain lạ: " + dom, "Tra domain; chặn nếu không rõ"))

    # File tháng được chọn và lệch hẳn ngày sửa phổ biến của plugin
    def mode_day(ts):
        return collections.Counter(datetime.date.fromtimestamp(t) for t in ts).most_common(1)[0][0]
    modes = {g: mode_day(ts) for g, ts in mtimes.items() if ts}
    for mt, rel in sorted(recent):
        g = group_of(rel)
        d = datetime.date.fromtimestamp(mt)
        if PHP_EXT.search(rel) and abs((d - modes[g]).days) > 3:
            findings.append((D if g in ("mu-plugins", "uploads") else S, g, rel, "", "PHP sửa %s, khác ngày phổ biến của plugin (%s)" % (d, modes[g]), "So với bản gốc"))

    order = {D: 0, S: 1}
    findings = sorted(set(findings), key=lambda r: (order[r[0]], r[1], r[2], str(r[3])))
    esc = lambda s: str(s).replace("|", "\\|")
    with open(out, "w", encoding="utf-8") as o:
        o.write("# Báo cáo quét mã độc\n\nThư mục: `%s` — %s\n\n" % (base, datetime.datetime.now().strftime("%Y-%m-%d %H:%M")))
        c = collections.Counter(r[0] for r in findings)
        o.write("Nguy hiểm: **%d** · Nghi ngờ: **%d**\n\n" % (c[D], c[S]))
        o.write("| Mức độ | Plugin | File | Dòng | Mô tả | Đề xuất |\n|---|---|---|---|---|---|\n")
        for r in findings:
            o.write("| " + " | ".join(esc(x) for x in r) + " |\n")
        o.write("\n## File sửa trong %s (%d file)\n\n" % (month, len(recent)))
        for mt, rel in sorted(recent, reverse=True):
            o.write("- %s  `%s`\n" % (datetime.datetime.fromtimestamp(mt).strftime("%Y-%m-%d %H:%M"), rel))
        o.write("\n## Số phát hiện theo plugin\n\n")
        per = collections.Counter((r[1], r[0]) for r in findings)
        for g in sorted({r[1] for r in findings}):
            o.write("- %s: Nguy hiểm %d, Nghi ngờ %d\n" % (g, per[(g, D)], per[(g, S)]))
    print("Nguy hiểm: %d, Nghi ngờ: %d, file %s: %d -> %s" % (c[D], c[S], month, len(recent), out))
    return 0


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # console Windows
    sys.exit(main(sys.argv))
