# Author: Petr Hýbl (xhyblp01@stud.fit.vutbr.cz)
from csv import writer
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
import seaborn as sns
from nltk.tokenize import word_tokenize
import numpy as np
import pandas as pd
import csv
import re
import nltk
nltk.download('punkt')

# Convert words to lower case, removes special characters and tokenize the transaction.


def clean_text_BERT(text):

    text = text.lower()
    text = re.sub(r'[^\wščřžýáíéúůťňď\s.]+|https?:\/\/\S+|\d+|"',
                  '', text, flags=re.IGNORECASE)
    text_list = word_tokenize(text)
    result = ' '.join(text_list)
    return result


transaction = []
category = []
df = pd.read_csv('statements/Datacleanaddedmostknow.csv')

text_raw = df['Transaction']
text_BERT = text_raw.apply(lambda x: clean_text_BERT(x))
print(text_BERT)
print(text_raw)


# Download pre-trained BERT model
bert_input = text_BERT.tolist()
model = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2')
embeddings = model.encode(bert_input, show_progress_bar=True)
embedding_BERT = np.array(embeddings)


# Load transaction detail data
def ai_categorization(transaction_text):

    # initialize list transaction
    data = [transaction_text]

    # Create the pandas DataFrame with Test column for transaction text
    df_test = pd.DataFrame(data, columns=['Test'])

    text_test_raw = df_test['Test']
    # Apply data cleaning function as for training data
    text_test_BERT = text_test_raw.apply(lambda x: clean_text_BERT(x))

    # Apply BERT
    bert_input_test = text_test_BERT.tolist()
    embeddings_test = model.encode(bert_input_test, show_progress_bar=True)
    embedding_BERT_test = np.array(embeddings_test)

    df_embedding_bert_test = pd.DataFrame(embeddings_test)

    # Find the most similar word embedding with new transaction data in the training data
    similarity_new_data = cosine_similarity(
        embedding_BERT_test, embedding_BERT)
    similarity_df = pd.DataFrame(similarity_new_data)

    # Returns index for most similar transaction
    index_similarity = similarity_df.idxmax(axis=1)

    # Find a transaction by the index of similarity
    data_inspect = df.iloc[index_similarity, :].reset_index(
        drop=True)

    unseen_verbatim = text_test_raw
    matched_verbatim = data_inspect['Transaction']
    category = data_inspect['Category']
    d_output = {
        'unseen_transaction': unseen_verbatim,
        'matched_transaction': matched_verbatim,
        'matched_class': category
    }
    print(category[0])
    # Return a category of the most similar transaction
    return category[0]
