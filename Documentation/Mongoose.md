    Collection==Tables
    Document==Entries of the Table

    1. Everything in Mongoose starts with a Schema. Each schema maps to a MongoDB collection and    defines the shape of the documents within that collection.
    2. Models are fancy constructors compiled from Schema definitions. An instance of a model is called a document. Models are responsible for creating and reading documents from the underlying MongoDB database.
