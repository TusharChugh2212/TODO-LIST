//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ =require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-tushar:chugh123@cluster0.c69nw.mongodb.net/todoListDB");
const itemsSchema = new mongoose.Schema({
  name: String
});
const listSchema={
  name:String,
  items:[itemsSchema]
};
const List=new mongoose.model("List",listSchema);
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todoList"
});
const item2 = new Item({
  name: "Hit the + button to add a new item"
});
const item3 = new Item({
  name: "<-- Hit this to delete an item"
});
const defaultItems = [item1, item2, item3];

app.get("/", function(req, res) {

  Item.find({},function(err,find){
    if(find.length===0){
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved default items");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {
        listTitle: "Today",newListItems: find
      });
    }

  });
});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const newItem=new Item({
    name:itemName
  });
  if(listName==="Today"){
    newItem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,found){
      found.items.push(newItem);
      found.save();
      res.redirect("/"+listName);
    });
  }

});
app.post("/delete",function(req,res){
  const checkedItemId=(req.body.checkbox);
  const listName=req.body.listTitle;
  if(listName==="Today"){
    Item.deleteOne({_id:checkedItemId},function(err){});
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name: listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

});

app.get("/about", function(req, res) {
  res.render("about");
});
app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
  if(!foundList)
  {
    const list=new List({
      name:customListName,
      items:defaultItems
    });
    list.save();
    res.redirect("/"+customListName);
  }
  else{
    res.render("list",{
      listTitle: customListName,newListItems: foundList.items
    });
  }
  });
});
// let port=process.env.PORT;
// if(port==NULL||port==""){
//   port=3000;
// }

app.listen(3000, function() {
  console.log("Server has startrd Successfully");
});
