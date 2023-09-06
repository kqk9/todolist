//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://mm2adg:test123@cluster0.kpbtzk5.mongodb.net/todolistDB" ,  {useNewUrlParser : true});

const itemSchema = {
  name : String,
};

const Item = mongoose.model("Item" , itemSchema);

const item = new Item ({
  name :"Welcome to your todolist! "
});

const item2 = new Item ({
  name :"Hit the + button to add item."
});

const item3 = new Item ({
  name :"<-- Hit this to delete an item. "
});

const listSchema ={
  name : String ,
  items : [itemSchema]
};

const List = mongoose.model("List" , listSchema);


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const defultItems =[item , item2 , item3];
app.get("/", function(req, res) {

// const day = date.getDate();

Item.find({}).then(item1 => {     
  if(item1.length ===0){
   
    Item.insertMany(defultItems).then(result => {
    console.log("done");
    res.redirect("/");
      
    }).catch(err =>{
      console.log(err); 
    });
       
  }else{

    res.render("list", {listTitle: "Today", newListItems: item1 });
  }
  })
  .catch(err => {
    console.error(err);
  });

});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list ;

  const newItem= new Item( {
    name : itemName
  });

  if(listName === "Today"){
    newItem.save();
    res.redirect("/");

  }else{
    List.findOne({name : listName }).then(foundList =>{
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName); 
  console.log("custon name is : " + customListName);
  List.findOne({name : customListName}).then(foundList =>{
    if(foundList){
      
      res.render("list", {listTitle: foundList.name, newListItems:foundList.items});
    }
    else if(customListName === "About"){
      res.render("about");
    }
    
    else{
      const list = new List( {
        name : customListName,
        items : defultItems
      });   
      list.save();
      res.redirect("/" + customListName);
    }
  });
});

//delete
app.post("/delete" , (req ,res)=>{
  const itemId = req.body.checkbox;
  const listName = req.body.listName;

  //delete from items 
  if(listName === "Today"){
    Item.findByIdAndRemove({ _id:itemId }).then(result =>{
      console.log("delete item result : "+result)
    }).catch(err =>{
      console.log( "delete item err :"+err);
    });
    res.redirect("/");

  }else{
    //delete item from an array in side the list coll
    List.findOneAndUpdate({name : listName} ,{$pull:{items : {_id : itemId}}}).then(result =>{
      console.log("delete list result"+result);
      res.redirect("/"+listName);
    }).catch(err=>{
      console.log("delete list err"+err);
    });
  }

  
});




app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server has started successfuly");
});
