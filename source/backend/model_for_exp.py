
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




def clean_text_BERT(text):

    text = text.lower()
    text = re.sub(r'[^\wščřžýáíéúůťňď\s.]+|https?:\/\/\S+|\d+|"',
                  '', text, flags=re.IGNORECASE)
    # Tokenise
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


#####################################
## Download pre-trained BERT model###
#####################################

# This may take some time to download and run
# depending on the size of the input

bert_input = text_BERT.tolist()
model = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2')
embeddings = model.encode(bert_input, show_progress_bar=True)
embedding_BERT = np.array(embeddings)


# Load texts
df_test = pd.read_csv('statements/testing.csv')
text_test_raw = df_test['Test']
print(text_test_raw)
# # Apply data cleaning function as for training data
text_test_BERT = text_test_raw.apply(lambda x: clean_text_BERT(x))
print("MODEL")
print(text_test_BERT)

# Apply BERT embedding
bert_input_test = text_test_BERT.tolist()
# model = SentenceTransformer('paraphrase-mpnet-base-v2')
embeddings_test = model.encode(bert_input_test, show_progress_bar=True)
embedding_BERT_test = np.array(embeddings_test)

df_embedding_bert_test = pd.DataFrame(embeddings_test)

# Find the most similar word embedding with unseen data in the training data

similarity_new_data = cosine_similarity(embedding_BERT_test, embedding_BERT)
similarity_df = pd.DataFrame(similarity_new_data)

# Returns index for most similar embedding
# See first column of the output dataframe below
index_similarity = similarity_df.idxmax(axis=1)

# Return dataframe for most similar embedding/transactions in training dataframe
data_inspect = df.iloc[index_similarity, :].reset_index(
    drop=True)

unseen_verbatim = text_test_raw
matched_verbatim = data_inspect['Transaction']
annotation = data_inspect['Category']

d_output = {
    'unseen_transaction': unseen_verbatim,
    'matched_transaction': matched_verbatim,
    'matched_class': annotation

}
output_file = 'experiment3.csv'

# Open the output file in write mode
with open(output_file, 'w', newline='') as csvfile:

    # Define the column headers for the CSV file
    fieldnames = ['unseen_transaction', 'matched_transaction', 'matched_class']

    # Create a writer object to write data to the CSV file
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    # Write the column headers to the CSV file
    writer.writeheader()

    # Write the data from the d_output dictionary to the CSV file
    for i in range(len(d_output['unseen_transaction'])):
        writer.writerow({'unseen_transaction': d_output['unseen_transaction'][i],
                         'matched_transaction': d_output['matched_transaction'][i],
                         'matched_class': d_output['matched_class'][i]})

print(d_output)
