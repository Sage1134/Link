import gensim

text_file_path = "textTrainingData.txt"

with open(text_file_path, "r", encoding="utf-8") as file:
    text_data = file.readlines()

processed_text = [gensim.utils.simple_preprocess(line) for line in text_data]

model = gensim.models.Word2Vec(
    window=10,
    min_count=2,
    workers=4
)

model.build_vocab(processed_text, progress_per=1000)

model.train(processed_text, total_examples=model.corpus_count, epochs=model.epochs)

model.save("matchModel.model")
