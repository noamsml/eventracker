#!/usr/bin/env python

from script_context import script_init
script_init()

from event_importer import EventImporter
import spreadsheet.googleauth as googleauth
from spreadsheet.googlesheets import GoogleRetriever
import db.connectivity as connectivity
import config
from datetime import date

def main():
    cnf = config.config()
    db_engine = connectivity.make_db_engine()
    google_retriever = GoogleRetriever(googleauth.retrieveCredentialsForUse(), cnf.sheet_id)
    event_importer = EventImporter(google_retriever, db_engine)
    imported = event_importer.perform_import(date.today())
    print("Performed import successfully! Imported {} rows".format(imported))
    
if __name__ == "__main__":
    main()