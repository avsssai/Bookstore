var express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    methodOverride = require('method-override'),
    sanitizer = require('express-sanitizer');


    var app = express();
    var PORT = 3000;
    app.use(bodyParser.urlencoded({extended:true}));
    app.use(sanitizer());
    //method override lets us use the different REST parameters other than GET and POST 
    //like PUT and DELETE. we have to declare the term we use for overriding.s
    app.use(methodOverride('_method'));

    //Connect to the database.
    mongoose.connect('mongodb://localhost:27017/bookstore',{useNewUrlParser:true,useUnifiedTopology:true,useFindAndModify:false},(err)=>{
        if(err){
            console.log({success:false,message:'Error in connecting to the database.'});
        }else{
            console.log({success:true,message:'Connected to the database.'});
        }
    })
    
    //Make a schema.
    var bookSchema = mongoose.Schema({
        name:String,
        author:String,
        imageUrl:String,
        publishedIn:Number,
        description:String
    });

    //Make a model to access the mongoDB methods.
    var Book = mongoose.model('book',bookSchema);

    //stylesheets
    app.use(express.static('public'));

    app.set("view engine","ejs");

    //INDEX route.
    app.get('/',(req,res)=>{
        res.redirect('/books');
    });

    app.get('/books',(req,res)=>{
        Book.find({},(err,allBooks)=>{
            if(err){
                console.log(err);
            }else{
                res.render('index',{books:allBooks});
            }
        })
    });

    //NEW route
    app.get('/books/new',(req,res)=>{
        res.render('new');
    })
    //CREATE A NEW BOOK.
    app.post('/books',(req,res)=>{
        req.body.book.description = req.sanitize(req.body.book.description);

        var newBook = req.body.book;
        console.log(req.body);
        Book.create(newBook,(err,bookCreated)=>{
            if(err){
                console.log(err);
            }else{
                res.redirect('/books');
                console.log({success:true,message:"Book created.",book:bookCreated});
            }
        })
    })
    //SHOW route.

    app.get('/books/:id',(req,res)=>{
        var id = req.params.id;
        Book.findById(id,(err,selectedBook)=>{
            if(err){
                console.log(err);
            }else{
                res.render('show',{book:selectedBook});
            }
        })
    })

    //DELETE a book
    app.delete('/books/:id',(req,res)=>{
        var id = req.params.id;
        Book.findByIdAndRemove(id,(err,deletedItem)=>{
            if(err){
                console.log(err);
                res.redirect('/books');
            }else{
                console.log({success:true,message:`Deleted Book : ${deletedItem.name}`});
                res.redirect('/books');
            }
        })
    })

    //EDIT a BOOK.
    app.get('/books/:id/edit',(req,res)=>{
        var id = req.params.id;
        Book.findById(id,(err,foundBook)=>{
            if(err){
                console.log(err);
            }else{
                res.render('edit',{book:foundBook});
            }
        })
    })

    //UPDATE route
    app.put('/books/:id',(req,res)=>{
        var id = req.params.id;
        req.body.book.description = req.sanitize(req.body.book.description);
        console.log(updateBook);
        Book.findByIdAndUpdate(id,updateBook,(err,updatedInfo)=>{
            if(err){
                console.log(err);
                res.redirect('/');
            }else{
                res.redirect(`/books/${id}`);
            }
        })

    })

    app.listen(PORT,()=>{
        console.log('Server started on ' + PORT);
    })