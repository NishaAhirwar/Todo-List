require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require("mongoose");
const _ = require("lodash");
const date= require(__dirname+"/date.js");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(express.json());


const password= process.env.PASSWORD;

mongoose.connect("mongodb+srv://admin-nisha:"+password+"@cluster0.vlxr2.mongodb.net/todolistDB",  { useNewUrlParser: true});

const itemsSchema= new mongoose.Schema({name: String}); //Item Schema
const listSchema =new mongoose.Schema({                 //List Schema
  name: String,
  list: [itemsSchema]
});

const Item= new mongoose.model('Item', itemsSchema);    //Item Model
const List=new mongoose.model('List', listSchema);      //List Model


const item1 = new Item({name: "Work"});
const item2 = new Item({name: "Eat"});
const item3 = new Item({name: "Sleep"});

const defaultArray=[item1,item2,item3];

var day= date.getDate();

//

app.get("/", function(req, res)
{
  Item.find({} , function(err,foundItem){
    if(foundItem.length===0){
      Item.insertMany(defaultArray,function(err){
        if(err){
          console.log(err);
        } else{
          res.render("list", { listTitle: day, newListItems: foundItem});
        }
      });
      res.redirect("/");
    } else{
      res.render("list", { listTitle: day, newListItems: foundItem});
    }
  });

});


app.get("/:customList", function(req,res){
  const customListName=_.capitalize(req.params.customList);

  List.findOne({name: customListName}, function(err, foundListName){
   if(!err){
    if(!foundListName){
      const listItem= new List({
        name: customListName,
        list: defaultArray
      });
      listItem.save();
      res.redirect("/"+customListName);

    }else{
      res.render("list", {listTitle: foundListName.name, newListItems: foundListName.list});


    }
  }
});

});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listTitle = req.body.list;

  const item= new Item({
  name: itemName });

  if(listTitle=== day){
      item.save();
      res.redirect("/");
    }else{
      List.findOne({name: listTitle}, function(err, foundListName){
        foundListName.list.push(item);
        foundListName.save();
        res.redirect("/"+ listTitle);
      });
    }
});






app.post("/delete",function(req,res){
  const checkedItem= req.body.checkbox;
  const listTitle= req.body.listTitleName;

  if(listTitle=== day){
     Item.findByIdAndRemove(checkedItem, function(err){
    if(err){
      console.log(err);
    }
    else{
      res.redirect("/");
    }
  });
   } 
   else{
    List.findOneAndUpdate({name: listTitle},{$pull: { list: {_id: checkedItem}}}, function(err, foundItem){
      if(!err){
        res.redirect("/"+ listTitle);
      }
    });
   }

 
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port , function() {
  console.log("Server started successfully");
});
