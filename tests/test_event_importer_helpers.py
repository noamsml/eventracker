import event_importer
from spreadsheet.decentered_spreadsheet import SheetRow
from datetime import date


def test_parse_time():
    assert event_importer._parse_time("10:30:01 AM") == 10 * 60 * 60 + 30 * 60 + 1
    assert event_importer._parse_time("5:00:00 PM") == 17 * 60 * 60
    assert event_importer._parse_time("12:00:00 PM") == 12 * 60 * 60
    assert event_importer._parse_time("12:30:00 AM") == 30 * 60
    assert event_importer._parse_time("20:30:00") == 20 * 60 * 60 + 30 * 60
    assert event_importer._parse_time("12:30:00 AM", event_importer._parse_time("5:00:00 PM")) == 24 * 60 * 60 + 30 * 60
    assert event_importer._parse_time("4:30:00 AM", event_importer._parse_time("5:00:00 PM")) == (24+4) * 60 * 60 + 30 * 60
    assert event_importer._parse_time("5:10 PM") == 17 * 60 * 60 + 10 * 60
    assert event_importer._parse_time("12 PM") == 12 * 60 * 60
    assert event_importer._parse_time("12") == 12 * 60 * 60
    assert event_importer._parse_time("?") == None

def test_get_cursor_updates():
    updates = [
        SheetRow(299, "04/22/2024", "", "", "", "", "", "", "", "", ""),
        SheetRow(300, "04/22/2024", "", "", "", "", "", "", "", "", ""),
        SheetRow(301, "04/23/2024", "", "", "", "", "", "", "", "", ""),
        SheetRow(302, "04/23/2024", "", "", "", "", "", "", "", "", ""),
        SheetRow(303, "04/24/2024", "", "", "", "", "", "", "", "", ""),
        SheetRow(304, "04/24/2024", "", "", "", "", "", "", "", "", ""),
    ]

    assert event_importer._cursor_updates(updates, date(2024, 4, 23)) == {date(2024, 4, 23): 301, date(2024, 4, 24): 303}