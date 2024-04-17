from google.oauth2.credentials import Credentials
from dataclasses import dataclass
from typing import List

import googlesheets

@dataclass
class SheetRow:
    row_number: int
    date: str
    name: str
    type: str
    start_time: str
    end_time: str
    location: str
    address: str
    description: str
    cost: str
    link: str = ""

@dataclass
class Batch:
    rows: List[SheetRow]
    has_more: bool

COL_RANGE=(1,10)
# To avoid spamming the server
MAX_BATCHES_AT_ONCE = 10

class DecenteredSheetImporter:
    def __init__(self, spreadsheet_retriever: googlesheets.GoogleRetriever, start_cursor: int, batch_size: int = 100):
        self.spreadsheet_retriever = spreadsheet_retriever
        self.cursor = start_cursor
        self.batch_size = batch_size
    
    def get_cursor(self) -> int:
        return self.cursor

    def retrieve_batch(self) -> Batch:
        raw_batch = self.spreadsheet_retriever.retrieve_spreadsheet_range(COL_RANGE, (self.cursor, self.cursor+self.batch_size))
        sheet_rows = [SheetRow(*row) for row in raw_batch]
        last_cursor = sheet_rows[-1].row_number
        has_more = last_cursor >= (self.cursor + self.batch_size - 1)
        self.cursor = last_cursor + 1
        return Batch(sheet_rows, has_more)
    
    def retrieve_all(self) -> List[SheetRow]:
        result: List[SheetRow] = []
        for i in range(MAX_BATCHES_AT_ONCE):
            batch = self.retrieve_batch()
            result.extend(batch.rows)
            if not batch.has_more:
                break
        return result