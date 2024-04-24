
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.oauth2.credentials import Credentials

class GoogleRetriever:
    def __init__(self, creds: Credentials, sheet_id: str):
        self.creds = creds
        self.sheet_id = sheet_id
            
    def retrieve_spreadsheet_range(self, colRange: tuple[int,int], rowRange: tuple[int, int]):
        valuerange = "R{}C{}:R{}C{}".format(rowRange[0], colRange[0], rowRange[1], colRange[1])
        service = build("sheets", "v4", credentials=self.creds)

        result = (
            service.spreadsheets()
            .values()
            .get(spreadsheetId=self.sheet_id, range=valuerange)
            .execute()
        )
        rows = result.get("values", [])
        
        # So the "domain correct" way to do this might be to have a dataclass with row number
        # and value as separate fields, but having the row number as a prefix works nicely for
        # splatting the row number plus other data into a dataclass constructor like
        # MyDataClass(*row_values) so I'll keep it
        numberPrefixedRows = [
            [row] + value for
            row, value in
            zip(range(rowRange[0], rowRange[1]), rows)
        ]

        return numberPrefixedRows