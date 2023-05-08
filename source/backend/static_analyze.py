# Author: Petr Hýbl (xhyblp01@stud.fit.vutbr.cz)
from nltk.tokenize import word_tokenize

transfer_money = ["revolut", "převod", "prevod"]
subscription = ["disney", "plus", "patreon", "membership",
                "hbo", "netflix", "hulu", "spotify", "subscription", "youtube"]
internet_shopping = ['gopay', 'paypal', 'alza', "gigaprint.cz", "ts", "bohemia"
                     "mall", "datart", "notino", "aliexpress"]
shopping = ["liquor", "shop", "luxor", "wonderful", "ikea", "siko", "gymbeam", "flamengo", "kvetiny", "megaknihy", "tiger", "uni", "hobby", "obi",
            "mountfield", "hornbach", "baumax", "bauhaus", "asko", "mobelix", "xxxlutz", "datart", "electro", "world", "okay", "planeo", "intersport", "dm", "drogerie", "teta", "drogerie", "rossman"
            ]

clothing = ["reserved", "house", "eobuv", "sportisimo", "adidas", "k3sport", "popname", "vinted",
            "aboutyou", "nike cz", "alpine", "deichman", "ccc", "bata", "a3", "sport", "sportisimo"]
fuel = ["omv", "benzinol", "benzina", "ono", "benzina", "mol", "eurooil",
        "zevos", "shell", "eurooil", "orlen", "cepro", "petrol", "cerpaci", "eurobit"]
groceries = ["rohlik", "tesco", "albert", "lidl", "potraviny", "mini market", "market", "coop", "hruska", "supermarket",
             "billa", "obchod", "hypermarket", "kaufland", "action", "enfin", "penny", "globus", "jip", "makro", "rohlik", "coop", "jednota"]
transportation = ["jizdne", "idsjmk", "arriva", "idos", "brnoid", "kodis", "idos.cz"
                  "ceske", "drahy", "studentagency", "operator ict", "cd", "edalnice", "flixbus", "nadrazi"]
food = ["obcerstveni", "food", "aaron", "kebab", "bistro", "roj", "kebab", "istanbul", "wokin", "wolt", "kfc", "mcdonalds", "mcd", "restaurace", "mcdonald", "comebuy", "barcelato", "poe-poe", "poe", "nepal", "subway", "buffalo", "express", "bakery", "pivni", "burza", "hospudka", "hospoda", "hostinec", "bb", "bageterie", "boulevard", "bakery", "sweet", "caffe", "kohuta",
        "minit", "restaurant", "guru", "indicka", "imigrant", "pub", "restaurant", "panoptik", "indicka", "rest", 'everest', "ugo", "salaterie", "waf", "waf", "sherwood", "digital", "kfcrozvoz", "dreveneho", "vlka", "turecky", "mcdonalds", "spizza", "pizza", "forkys", "zlata", "lod", "mashbro", "donuteria", "burger", "brothers", "sbx", "delikomat", "kantyna"]
phone = ["t-mobile", "vodafone", "o2"]

utilities = ["energy", "internet", "zaloha", "nedoplatek", "eon"]
ATM = ["atm"]
rent = ["najem", "hypoteka", ""]

# Function that tokenize text and than try to find a matching category by the text detail


def tr_static(tr_text):
    tr_tokenize = word_tokenize(tr_text)
    tr_tokenize2 = []
    for token in tr_tokenize:
        token = token.split('.')
        for tok in token:
            tr_tokenize2.append(tok)
    print(tr_tokenize)
    for token in tr_tokenize2:
        if token in transfer_money:
            return "Transfer Money"
        elif token in ATM:
            return "ATM"
        elif token in subscription:
            return "Subscription"
        elif token in internet_shopping:
            return "Internet Shopping"
        elif token in shopping:
            return "Shopping"
        elif token in clothing:
            return "Clothing"
        elif token in fuel:
            return "Fuel"
        elif token in groceries:
            return "Groceries"
        elif token in transportation:
            return "Transportation"
        elif token in food:
            return "Food"
        elif token in phone:
            return "Phone"
    return "Unknown"
