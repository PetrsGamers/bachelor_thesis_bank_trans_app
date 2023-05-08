# Author: Petr Hýbl (xhyblp01@stud.fit.vutbr.cz)
import xml.etree.ElementTree as ET
from static_analyze import *
from model import *
import csv
import os
import re
UPLOAD_FOLDER = 'statements'

# class for a transaction object


class Trans:
    def __init__(self, category, detail, amount, other):
        self.category = category
        self.detail = detail
        self.amount = amount
        self.other = other

    def __repr__(self):
        return f"<Trans(category='{self.category}', detail='{self.detail}', amount={self.amount},)>"


def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^\wščřžýáíéúůťňď\s.]+|https?:\/\/\S+|\d+|"',
                  '', text, flags=re.IGNORECASE)
    return text


def contains_only_spaces(input_string):
    # Use the regex pattern \s+ to match one or more whitespace characters
    pattern = r'^\s+$'
    return re.match(pattern, input_string) is not None


def KB_analyze(currentStatement):

    # open the CSV file
    # with open(UPLOAD_FOLDER + '/' + currentStatement, encoding='windows-1250') as file:
    temp_filename = 'temp.csv'

    # Delete the first 17 lines of the file
    with open(UPLOAD_FOLDER + '/' + currentStatement, 'r', encoding='windows-1250') as infile, open(temp_filename, 'w') as outfile:
        line_count = 0
        for line in infile:
            line_count += 1
            if line_count > 18:
                outfile.write(line)

    # Close the original file and rename the temporary file
    infile.close()
    outfile.close()
    os.rename(temp_filename, UPLOAD_FOLDER + '/' + currentStatement)

    # Open the CSV file and find the column
    tr_list = []
    other = ''
    with open(UPLOAD_FOLDER + '/' + currentStatement, 'r', encoding='utf-8') as file:
        reader = csv.reader(file, delimiter=';')
        for row in reader:
            print(row[15])
            if "karty" in row[3].lower():
                other = 'card'
            tra = Trans('0', row[15], row[4], other)
            tra.detail = clean_text(tra.detail)
            tra.category = tr_static(tra.detail)
            tra.amount = tra.amount.replace(',', '.')
            if (tra.category == "Unknown"):
                tra.category = ai_categorization(tra.detail)
            if (contains_only_spaces(tra.detail)):
                tra.category = "Unknown"
            if (tra.detail == ""):
                tra.category = "Unknown"
            print(Trans.__repr__(tra))
            tr_list.append(tra)
    return tr_list


def UniCredit_analyze(currentStatement):

    temp_filename = 'temp.csv'

    # open the CSV file
    # Delete the first 17 lines of the file
    with open(UPLOAD_FOLDER + '/' + currentStatement, 'r', encoding='utf-8') as infile, open(temp_filename, 'w') as outfile:
        line_count = 0
        for line in infile:
            line_count += 1
            if line_count > 4:
                outfile.write(line)

    # Close the original file and rename the temporary file
    infile.close()
    outfile.close()
    os.rename(temp_filename, UPLOAD_FOLDER + '/' + currentStatement)

    # Open the CSV file and find the 'my' column
    tr_list = []
    other = ''
    with open(UPLOAD_FOLDER + '/' + currentStatement, 'r', encoding='utf-8') as file:
        reader = csv.reader(file, delimiter=';')
        for row in reader:
            if "karty" in row[3].lower():
                other = 'card'
            tra = Trans('0', row[9], row[1], other)
            tra.detail = clean_text(tra.detail)
            tra.category = tr_static(tra.detail)
            tra.amount = tra.amount.replace(',', '.')
            if (tra.category == "Unknown"):
                tra.category = ai_categorization(tra.detail)
            if (contains_only_spaces(tra.detail)):
                tra.category = "Unknown"
            if (tra.detail == ""):
                tra.category = "Unknown"
            print(Trans.__repr__(tra))
            tr_list.append(tra)
    return tr_list

# All the templates are based on tested statements.


def Airbank_analyze(currentStatement):
    tr_list = []
    other = ""
    with open(UPLOAD_FOLDER + '/' + currentStatement, newline='', encoding='windows-1250') as csvfile:
        reader = csv.DictReader(csvfile, delimiter=';')
        for row in reader:
            detail = row['Název protistrany']
            amount = row["Částka v měně účtu"]
            amount = amount.replace(',', '.')
            tra = Trans(
                '0', detail, amount, other)
            tra.category = tr_static(
                tra.detail.lower())
            if (tra.category == "Unknown"):
                tra.category = ai_categorization(detail)
            if (contains_only_spaces(tra.detail)):
                tra.category = "Unknown"
            if (tra.detail == ""):
                tra.category = "Unknown"
            tr_list.append(tra)
            print(tra)
    return tr_list


def Fio_analyze(currentStatement):

    tr_list = []
    other = ""
    with open(UPLOAD_FOLDER + '/' + currentStatement, encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile, delimiter=';')
        next(reader)
        for row in reader:
            print(row)
            try:
                detail = row['Název obchodníka']
                if detail == "":
                    detail = row[8]
            except:
                detail = row[8]
            try:
                amount = row["Zaúčtovaná částka"]

            except:
                print(row[0])
                amount = row[0]
            try:
                if row["Kategorie transakce"] == "Trvalá platba":
                    other = 'pernament'
            except:
                other = 'card'
            amount = amount.replace(',', '.')
            amount = amount.replace(' ', '')
            tra = Trans(
                '0', detail, amount, other)
            tra.category = tr_static(
                tra.detail.lower())
            if (tra.category == "Unknown"):
                tra.category = ai_categorization(detail)
            if (contains_only_spaces(tra.detail)):
                tra.category = "Unknown"
            if (tra.detail == ""):
                tra.category = "Unknown"
            tr_list.append(tra)
            other = ""
            print(tra)
    return tr_list


def Moneta_analyze(currentStatement):
    tree = ET.parse(UPLOAD_FOLDER + '/' + currentStatement)
    root = tree.getroot()
    other = ""
    amount = 0
    tr_list = []
    detail = ""
    for child in root:
        # print(child.tag)
        if 'transactions' == child.tag:
            for children in child:
                if 'transaction' == children.tag:
                    amount = children.attrib['amount']
                    for babies in children:
                        if babies.tag == 'trn-messages':
                            for baby in babies:
                                if baby.tag == 'trn-message':
                                    detail = baby.text
                    tra = Trans(
                        '0', detail, amount, other)
                    tra.category = tr_static(
                        tra.detail.lower())
                    if (tra.category == "Unknown"):
                        tra.category = ai_categorization(detail)
                    if (contains_only_spaces(tra.detail)):
                        tra.category = "Unknown"
                    if (tra.detail == ""):
                        tra.category = "Unknown"
                    tr_list.append(tra)
                    print(tra)
    return tr_list


def CSOB_analyze(currentStatement):
    tree = ET.parse(UPLOAD_FOLDER + '/' + currentStatement)
    root = tree.getroot()
    other = ""
    amount = 0
    tr_list = []
    detail = ""
    print(root)
    for child in root:
        for children in child:
            for babies in children:
                if 'Ntry' in babies.tag:
                    for baby in babies:
                        if 'Amt' in baby.tag:
                            amount = baby.text
                            print(amount)
                        if 'CdtDbtInd' in baby.tag:
                            if 'DBIT' in baby.text:
                                amount = '-' + amount
                            else:
                                if amount != 0:
                                    detail = ""

                                    tra = Trans(
                                        'Unknown', detail, amount, other)

                                    tr_list.append(tra)
                                    print(tra)

                        if 'NtryDtls' in baby.tag:
                            for animal in baby:
                                if 'TxDtls' in animal.tag:
                                    for fish in animal:
                                        if 'RmtInf' in fish.tag:
                                            for atom in fish:
                                                if 'Ustrd' in atom.tag:
                                                    detail = atom.text
                                                    detail = detail.replace(
                                                        "Misto:", '')
                                                    try:
                                                        index = detail.index(
                                                            "Castka:")
                                                        detail = detail[:index:]
                                                    except:
                                                        detail = detail
                                                    print(detail)
                                                    tra = Trans(
                                                        '0', detail, amount, other)
                                                    tra.category = tr_static(
                                                        tra.detail.lower())
                                                    if (tra.category == "Unknown"):
                                                        tra.category = ai_categorization(
                                                            detail)
                                                    if (contains_only_spaces(tra.detail)):
                                                        tra.category = "Unknown"
                                                    tr_list.append(tra)
                                                    print(tra)

        return tr_list

    return
