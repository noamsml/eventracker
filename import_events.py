#!/usr/bin/env python
from event_importer import EventImporter
import googleauth
from googlesheets import GoogleRetriever
import db_connectivity
import config
from datetime import date

def main():
    cnf = config.config()
    db_engine = db_connectivity.make_db_engine()
    google_retriever = GoogleRetriever(googleauth.retrieveCredentialsForUse(), cnf.sheet_id)
    event_importer = EventImporter(google_retriever, db_engine)
    imported = event_importer.perform_import(date.today())
    print("Performed import successfully! Imported {} rows".format(imported))
    
if __name__ == "__main__":
    main()