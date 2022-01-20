const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _  = require("lodash");
require('dotenv').config();

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

var uri = process.env.DB_PATH;
mongoose.connect(uri, { useNewUrlParser: true });

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
    name: "Welcome"
});
const item2 = new Item({
    name: "Hitt the + button to add new item."
});
const item3 = new Item({
    name: "<--Hit this to delete an item."
});
const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {

    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully Saved.");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", { kindOfDay: "Today", newListItems: foundItems });
        }
    })
});

app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/");
            } else {
                res.render("list", { kindOfDay: foundList.name, newListItems: foundList.items })
            }
        }
    })



});

app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }

});

app.post("/delete", function (req, res) {
    const checkedItemID = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemID, function (err) {
            if (!err) {
                console.log("Succefully deleted checked item.");
                res.redirect("/");
            }
        });
    }else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}}, function(err, foundList){
            if(!err){
                res.redirect("/"+listName);
            }
        })
    }
});

let port = process .env.PORT;
if (port == null || port ==""){
    port = 4000;
}

app.listen(port, function (req, res) {
    console.log("Server is ready.");
});

function newFunction() {
    const dotenv = require("dotenv");
    dotenv.config();
}
