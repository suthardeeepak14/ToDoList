import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", express.static("./node_modules/bootstrap/dist/"));

mongoose
  .connect("mongodb://0.0.0.0:27017/toDoListDB", {
    useNewUrlParser: true,
  })
  .then(() => console.log("Connection succesfully..."))
  .catch((err) => console.log(err));

const newItemsSchema = new mongoose.Schema({
  name: String,
});
const NewItems = mongoose.model("NewItem", newItemsSchema);

const item1 = new NewItems({
  name: "Welcome to your ToDOList!",
});

const item2 = new NewItems({
  name: "Hit the + button to add a new item.",
});

const defaultItem = [item1, item2];

const listSchema = {
  name: String,
  custItems: [newItemsSchema],
};

const List = mongoose.model("List", listSchema);

async function getItems() {
  const Items = await NewItems.find({});
  return Items;
}

app.get("/", (req, res) => {
  getItems().then(function (FoundItems) {
    if (FoundItems.length === 0) {
      NewItems.insertMany(defaultItem)
        .then(function () {
          console.log("Successfully Inserted!");
        })
        .catch(function (err) {
          console.log(err);
        });
      res.redirect("/");
    } else {
      res.render("index.ejs", { newListItems: FoundItems });
    }
  });
});

app.get("/:customListName", (req, res) => {
  const customListName = req.params.customListName;
  List.findOne({ name: customListName })
    .then((found) => {
      if (!found) {
        const list = new List({
          name: customListName,
          custItems: defaultItem,
        });
        list.save();
        res.redirect("/" + customListName);
      }
      if (found) {
        res.render("work.ejs", { newCustItems: found.custItems });
      }
    })
    .catch((err) => console.log(err));
});

app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const item = new NewItems({
    name: itemName,
  });
  item.save();
  res.redirect("/");
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  NewItems.findOneAndDelete({ _id: checkedItemId })

    .then(function () {
      console.log("Removed successfully!");
      res.redirect("/");
    })
    .catch(function (err) {
      console.log(err);
    });
});
app.post("/work", (req, res) => {
  const itemName = req.body.newItem;
  const item = new NewItems({
    name: itemName,
  });
  item.save();
  res.redirect("/work");
});

app.listen(port, () => {
  console.log("server is running on port: " + port);
});
