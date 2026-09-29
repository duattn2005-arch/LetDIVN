<?php
// A minimal .xlsx writer (one sheet of text and number cells), the same as the
// website's admin (src/admin/xlsx.ts). A CSV lands in a single column in Excel
// on Vietnamese Windows (its list separator is ";", not ",") and loses the
// leading 0 of phone numbers; a real workbook has neither problem.

defined('ABSPATH') || exit;

function ldv_xlsx_escape(string $s): string
{
    // Control characters are not allowed in XML (tab and line breaks are).
    $s = (string) preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/', '', $s);
    return htmlspecialchars($s, ENT_QUOTES | ENT_XML1, 'UTF-8');
}

/** 0 -> A, 25 -> Z, 26 -> AA … */
function ldv_xlsx_column(int $i): string
{
    return ($i < 26 ? '' : ldv_xlsx_column(intdiv($i, 26) - 1)) . chr(65 + $i % 26);
}

/**
 * The workbook: one sheet, a bold header row that stays visible while
 * scrolling and has filter buttons, then the rows (numbers stay numbers).
 */
function ldv_xlsx(string $sheet_name, array $header, array $rows): string
{
    $head = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . "\n";
    $all = array_merge([$header], $rows);
    $cols = count($header);
    $last = ldv_xlsx_column($cols - 1) . count($all);

    // Column widths from the longest value (capped), like Excel's autofit.
    $widths = '';
    for ($c = 0; $c < $cols; $c++) {
        $w = 8;
        foreach ($all as $r) {
            $w = max($w, mb_strlen((string) ($r[$c] ?? '')) + 2);
        }
        $widths .= sprintf('<col min="%1$d" max="%1$d" width="%2$d" customWidth="1"/>', $c + 1, min(60, $w));
    }

    $data = '';
    foreach ($all as $i => $r) {
        $data .= '<row r="' . ($i + 1) . '">';
        foreach (array_values($r) as $c => $v) {
            $ref = ldv_xlsx_column($c) . ($i + 1);
            $style = $i === 0 ? ' s="1"' : '';
            if (is_int($v) || is_float($v)) {
                $data .= "<c r=\"$ref\"$style><v>$v</v></c>";
            } elseif ((string) $v !== '') {
                $data .= "<c r=\"$ref\" t=\"inlineStr\"$style><is><t xml:space=\"preserve\">" . ldv_xlsx_escape((string) $v) . '</t></is></c>';
            }
        }
        $data .= '</row>';
    }

    // Sheet names: max 31 characters, none of : \ / ? * [ ]
    $name = ldv_xlsx_escape(trim(mb_substr((string) preg_replace('/[:\\\\\/?*\[\]]/', ' ', $sheet_name), 0, 31)) ?: 'Sheet1');
    $rels = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
    $main = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';

    return ldv_zip([
        '[Content_Types].xml' => $head
            . '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            . '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            . '<Default Extension="xml" ContentType="application/xml"/>'
            . '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            . '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            . '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
            . '</Types>',
        '_rels/.rels' => $head
            . '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            . "<Relationship Id=\"rId1\" Type=\"$rels/officeDocument\" Target=\"xl/workbook.xml\"/>"
            . '</Relationships>',
        'xl/workbook.xml' => $head
            . "<workbook xmlns=\"$main\" xmlns:r=\"$rels\">"
            . "<sheets><sheet name=\"$name\" sheetId=\"1\" r:id=\"rId1\"/></sheets>"
            // The header row's filter buttons need this defined name.
            . '<definedNames><definedName name="_xlnm._FilterDatabase" localSheetId="0" hidden="1">\'' . str_replace("'", "''", $name) . '\'!$A$1:$' . ldv_xlsx_column($cols - 1) . '$' . count($all) . '</definedName></definedNames>'
            . '</workbook>',
        'xl/_rels/workbook.xml.rels' => $head
            . '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            . "<Relationship Id=\"rId1\" Type=\"$rels/worksheet\" Target=\"worksheets/sheet1.xml\"/>"
            . "<Relationship Id=\"rId2\" Type=\"$rels/styles\" Target=\"styles.xml\"/>"
            . '</Relationships>',
        'xl/styles.xml' => $head
            . "<styleSheet xmlns=\"$main\">"
            . '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>'
            . '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>'
            . '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
            . '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
            . '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>'
            . '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>'
            . '</styleSheet>',
        'xl/worksheets/sheet1.xml' => $head
            . "<worksheet xmlns=\"$main\">"
            . '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>'
            . "<cols>$widths</cols>"
            . "<sheetData>$data</sheetData>"
            . "<autoFilter ref=\"A1:$last\"/>"
            . '</worksheet>',
    ]);
}

/** A ZIP of the files (stored, uncompressed: Excel reads it fine). */
function ldv_zip(array $files): string
{
    $t = getdate();
    $time = ($t['hours'] << 11) | ($t['minutes'] << 5) | ($t['seconds'] >> 1);
    $date = (($t['year'] - 1980) << 9) | ($t['mon'] << 5) | $t['mday'];
    $body = '';
    $central = '';
    foreach ($files as $path => $data) {
        $crc = crc32($data);
        $len = strlen($data);
        $offset = strlen($body);
        // 0x0800: UTF-8 names.
        $body .= pack('VvvvvvVVVvv', 0x04034b50, 20, 0x0800, 0, $time, $date, $crc, $len, $len, strlen($path), 0) . $path . $data;
        $central .= pack('VvvvvvvVVVvvvvvVV', 0x02014b50, 20, 20, 0x0800, 0, $time, $date, $crc, $len, $len, strlen($path), 0, 0, 0, 0, 0, $offset) . $path;
    }
    return $body . $central . pack('VvvvvVVv', 0x06054b50, 0, 0, count($files), count($files), strlen($central), strlen($body), 0);
}
