const express = require("express")
const mongoose = require("mongoose")
const { checkSchema, validationResult } = require('express-validator')
const app = express()
const port = 6000


mongoose.connect('mongodb://127.0.0.1:27017/task-app')
    .then(() => {
        console.log("connected to db");
    })
    .catch((err) => {
        console.log("err connecting to db", err);
    })

    app.listen(port, () =>{
        console.log("server running on port",port);
    })
//enable express
app.use(express.json())

const { Schema, model } = mongoose
const TaskSchema = new Schema(
    {
        title: String,
        description: String,
        status: String
    },
    { timestamps: true }
)

const task = model('task', TaskSchema)

const taskValidationSchema = {
    title: {
        in: ['body'],
        exists: {
            errorMessage: "title is required"
        },
        notEmpty: {
            errorMessage: "title cannot be empty"
        },
        isLength: {
            options: { min: 5 },
            errorMessage: "title should be at least 5 character long "
        },
        trim: true,
        custom: {
            options: function (value) {
                return task.findOne({ title: value })
                    .then((obj) => {
                        if (obj) {
                            throw new Error("title name already exists")
                        } else {
                            return true
                        }
                    })
            }
        }

    },
    description: {
        in: ['body'],
        exists: {
            errorMessage: "description required "
        },
        notEmpty: {
            errorMessage: "description cannot be empty"
        }
    },
    status: {
        isIn: {
            options: [["pending", "in progress", "completed"]],
            errorMessage: "status should be one of (pending, in progress, complete)",
        }
    }
}

const idValidationSchema ={
    id:{
        in:['params'],
        isMongoId:{
            errorMessage:"should be valid id"
        }
    }
}

const updateValidationSchema = {
    title: {
        in: ['body'],
        exists: {
            errorMessage: "title is required"
        },
        notEmpty: {
            errorMessage: "title cannot be empty"
        },
        isLength: {
            options: { min: 5 },
            errorMessage: "title should be at least 5 character long "
        },
        trim: true,

    },
    description: {
        in: ['body'],
        exists: {
            errorMessage: "description required "
        },
        notEmpty: {
            errorMessage: "description cannot be empty"
        }
    },
    status: {
        isIn: {
            options: [["pending", "in progress", "completed"]],
            errorMessage: "status should be one of (pending, in progress, complete)",
        }
    },
    id:{
        in:['params'],
        isMongoId:{
            errorMessage:"should be valid id"
        }
    }
}


app.post('/tasks',checkSchema(taskValidationSchema),(req,res) =>{
    const errors= validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const body= req.body
    // task.create(body)
    // const tasks =new task()
    task.create(body)
    // tasks.save()
    .then((tasks) =>{
        res.status(201).json(tasks)
    })
    .catch((err) =>{
        res.status(500).json(err,"internal server error")
     })
})



app.get('/tasks' ,(req,res) =>{
    task.find()
    .then((obj) =>{
        res.json(obj)
    })
    .catch((err) =>{
        res.json(err)
    })
})

app.get("/tasks/:id" ,checkSchema(idValidationSchema),(req,res) =>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const id =req.params.id
    task.findById(id)
    .then((tasks) =>{
       if (!tasks){
            return res.status(404).json({})
        }
        res.json(tasks)
    })
    .catch((err) =>{
        res.json(err)
    })
})

app.put('/tasks/:id',checkSchema(updateValidationSchema), (req,res) =>{
const errors=validationResult(req)
if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()})
}
const id =req.params.id
const body =req.body
task.findByIdAndUpdate(id,body,{new:true})
.then((tasks) =>{
    if(!tasks){
        return res.status(404).json({})

    }
    res.json(tasks)
})
.catch((err) =>{
res.json(err)
})
})

app.delete('/tasks/:id' ,checkSchema(idValidationSchema),(req,res) =>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const id =req.params.id
    task.findByIdAndDelete(id)
    .then((tasks) =>{
        if(!tasks){
            return res.status(404).json({})
        }
        res.json(tasks)
    })
    .catch((err) =>{
        console.log(err);
        res.json(500).json({error:"internal server error"})
    })
})
