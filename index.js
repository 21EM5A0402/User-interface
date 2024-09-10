const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

// Schema
const schemaData = mongoose.Schema({
  name: String,
  email: String,
  mobile: String,  // changed mobile to String to handle leading zeros
}, {
  timestamps: true,
});

const userModel = mongoose.model("user", schemaData);

// Read data and send as HTML with Edit/Delete buttons
app.get("/", async (req, res) => {
  const data = await userModel.find({});

  
  // Create an HTML table with Edit/Delete buttons
  let tableHTML = `
    <html>
    <head>
      <title>User Data</title>
      <style>
        table {
          width: 100%;
          border-collapse: collapse;
        }
        table, th, td {
          border: 1px solid black;
        }
        th, td {
          padding: 8px;
          text-align: left;
        }
        button {
          margin-right: 5px;
          padding: 8px 12px;
          border: none;
          cursor: pointer;
          font-size: 14px;
        }
        
        /* Edit button: green */
        .edit-btn {
          background-color: #4CAF50; /* Green */
          color: white;
        }

        /* Delete button: red */
        .delete-btn {
          background-color: #f44336; /* Red */
          color: white;
        }

        /* Optional: hover effect */
        button:hover {
          opacity: 0.8;
        }
      </style>
      <script>
        function editUser(id, name, email, mobile) {
          const newName = prompt("Enter new name:", name);
          const newEmail = prompt("Enter new email:", email);
          const newMobile = prompt("Enter new mobile:", mobile);

          if (newName && newEmail && newMobile) {
            fetch("/update", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ id, name: newName, email: newEmail, mobile: newMobile })
            })
            .then(response => response.json())
            .then(data => {
              if (data.success) {
                alert("User updated successfully");
                window.location.reload();
              } else {
                alert("Failed to update user");
              }
            });
          }
        }

        function deleteUser(id) {
          if (confirm("Are you sure you want to delete this user?")) {
            fetch("/delete/" + id, {
              method: "DELETE"
            })
            .then(response => response.json())
            .then(data => {
              if (data.success) {
                alert("User deleted successfully");
                window.location.reload();
              } else {
                alert("Failed to delete user");
              }
            });
          }
        }
      </script>
    </head>
    <body>
      <h2>User Data</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Created At</th>
            <th>Updated At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>`;

  // Loop through data and append rows to the table
  data.forEach(user => {
    tableHTML += `
      <tr>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.mobile}</td>
        <td>${new Date(user.createdAt).toLocaleString()}</td>
        <td>${new Date(user.updatedAt).toLocaleString()}</td>
        <td>
          <button class="edit-btn" onclick="editUser('${user._id}', '${user.name}', '${user.email}', '${user.mobile}')">Edit</button>
          <button class="delete-btn" onclick="deleteUser('${user._id}')">Delete</button>
        </td>
      </tr>`;
  });

  tableHTML += `
        </tbody>
      </table>
    </body>
    </html>`;



  // Send the HTML as a response
  res.send(tableHTML);
});

// Create data and save
app.post("/create", async (req, res) => {
  const data = new userModel(req.body);
  await data.save();
  res.send({ success: true, message: "Data saved successfully", data: data });
});

// Update data
app.put("/update", async (req, res) => {
  const { id, ...rest } = req.body;
  const data = await userModel.updateOne({ _id: id }, rest);
  res.send({ success: true, message: "Data updated successfully", data: data });
});

// Delete data
app.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;
  const data = await userModel.deleteOne({ _id: id });
  res.send({ success: true, message: "Data deleted successfully", data: data });
});

mongoose.connect("mongodb://127.0.0.1:27017/crudoperations")
  .then(() => {
    console.log("Connected to DB");
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  })
  .catch((err) => console.log(err));
