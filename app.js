// Dependencies
var express             = require('express'),
    app                 = express(),
    mongoose            = require('mongoose'),
    bodyParser          = require('body-parser'),
    methodOverride      = require('method-override'),
    expressSanitizer    = require('express-sanitizer'),
    //Set to desired PORT and IP
    PORT, IP;

// APP CONFIG
mongoose.connect('mongodb://localhost/restful_blog_app');   //Set to proper mongodb connection
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

// MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: { type: Date, default: Date.now } //allows a default date
})
var Blog = mongoose.model('Blog', blogSchema);

// Blog.create({
//     title: "Test Blog",
//     image: "https://images.unsplash.com/photo-1442605527737-ed62b867591f?dpr=1&auto=format&fit=crop&w=1500&h=1000&q=80&cs=tinysrgb&crop=",
//     body: "Hello, this is a test blog post."
// })

// RESTful Routes

// Landing page redirects to INDEX
app.get('/', function (req, res) {
    res.redirect('/blogs');
})

// INDEX ROUTE
app.get('/blogs', function (req, res) {
    Blog.find({}, function (err, blogs) {
        if (err)
            console.log("ERROR !");
        else {
            res.render("index", { blogs });
        }
    })
});

// NEW ROUTE
app.get('/blogs/new', function (req, res) {
    res.render('new');
})

// CREATE ROUTE
app.post('/blogs', function (req, res) {
    //create blog
    req.body.blog.body = req.sanitize(req.body.blog.body);  //sanitize input
    Blog.create(req.body.blog, function (err, newBlog) {
        if (err)
            res.render("new");
        else {
            //then, redirect to the index
            res.redirect('/blogs');
        }
    });
})

// SHOW ROUTE
app.get('/blogs/:id', function (req, res) {
    Blog.findById(req.params.id, function (err, foundBlog) {
        if (err)
            res.redirect("/blogs");
        else {
            res.render("show", { blog: foundBlog });
        }
    })
});

// EDIT ROUTE
app.get("/blogs/:id/edit", function (req, res) {
    Blog.findById(req.params.id, function (err, foundBlog) {
        if (err)
            res.redirect('/blogs');
        else {
            res.render("edit", { blog: foundBlog });
        }
    });
})

// UPDATE ROUTE
app.put("/blogs/:id", function (req, res) {
    req.body.blog = req.sanitize(req.body.blog);    //sanitize input
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function (err, updatedBlog) {
        if (err)
            res.redirect('/blogs');
        else {
            res.redirect('/blogs/' + req.params.id);
        }
    })
})

// DELETE ROUTE
app.delete("/blogs/:id", function (req, res) {
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err)
            res.redirect("/blogs");
        else
            res.redirect("/blogs");
    })
})

// Start server
app.listen(PORT || 3000, IP || 'localhost', function () {
    console.log('Server is running!');
})