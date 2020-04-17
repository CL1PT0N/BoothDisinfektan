const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const jwt = require('jsonwebtoken')
const app = express()
const secretKey = 'thisisverysecretkey'
const adminKey = 'thisisverysecretkey'

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

const db = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '',
    database: "disinfektan"
})

db.connect((err) => {
    if (err) throw err
    console.log('Database connected')
})

/************** JWT USER ***************/
const isAuthorized = (request, result, next) => {
    if (typeof(request.headers['user-auth']) == 'undefined') {
        return result.status(403).json({
            success: false,
            message: 'Unauthorized. Token Is Not Provided Or Invalid'
        })
    }

    let token = request.headers['user-auth']

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return result.status(401).json({
                success: false,
                message: 'Unauthorized. Token is Token Is Not Provided Or Invalid'
            })
        }
    })

    next()
}

/************** HOMEPAGE ***************/
app.get('/', (request, result) => {
    result.json({
        success: true,
        message: 'Welcome!'
    })
})

/************** REGISTER USER ***************/
app.post('/register/user', (request, result) => {
    let data = request.body

    let sql = `
        insert into user (name, email, password)
        values ('`+data.name+`', '`+data.email+`', '`+data.password+`');
    `

    db.query(sql, (err, result) => {
        if (err) throw err
    })

    result.json({
        success: true,
        message: 'Your Account Succesfully Registered!'
    })
})

/************** LOGIN USER ***************/
app.post('/login', function(request, result) {
  let data = request.body
	var email = data.email;
	var password = data.password;
	if (email && password) {
		db.query('SELECT * FROM user WHERE email = ? AND password = ?', [email, password], function(error, results, fields) {
			if (results.length > 0) {
        let token = jwt.sign(data.email + '|' +data.password, secretKey)
        result.json({
          success: true,
          message: 'Logged In',
          token: token
        });
			} else {
				result.json({
          success: false,
          message: 'Invalid Credential!',
        });
			}
			result.end();
		});
	}
});

/************** GET ALL booth ***************/
app.get('/booth', isAuthorized, (req, res) => {
    let sql = `
        select * from places
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            success: true,
            message: 'Success retrieve data from database',
            data: result
        })
    })
})

/************** GET BOOTH BY ID ***************/
app.get('/places/show/:id', isAuthorized, (req, res) => {
    let sql = `
        select * from places
        where id = `+req.params.id+`
        limit 1
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "Success Getting booth Details",
            data: result[0]
        })
    })
})

//========== ADMIN ==========//
//========== ADMIN ==========//
//========== ADMIN ==========//

/************** JWT ADMIN ***************/
const adminAuth = (request, result, next) => {
    if (typeof(request.headers['admin-auth']) == 'undefined') {
        return result.status(403).json({
            success: false,
            message: 'Unauthorized. Token Is Not Provided Or Invalid'
        })
    }

    let token = request.headers['admin-auth']

    jwt.verify(token, adminKey, (err, decoded) => {
        if (err) {
            return result.status(401).json({
                success: false,
                message: 'Unauthorized. Token Is Not Provided Or Invalid'
            })
        }
    })

    next()
}

/************** LOGIN ADMIN ***************/
app.post('/adm/login', function(request, result) {
  let data = request.body
	var email = data.email;
	var password = data.password;
	if (email && password) {
		db.query('SELECT * FROM admin WHERE email = ? AND password = ?', [email, password], function(error, results, fields) {
			if (results.length > 0) {
        let token = jwt.sign(data.email + '|' +data.password, adminKey)
        result.json({
          success: true,
          message: 'Logged In',
          token: token
        });
			} else {
				result.json({
          success: false,
          message: 'Invalid Credential!',
        });
			}
			result.end();
		});
	}
});

/************** GET ALL BOOTH ***************/
app.get('/adm/rooms', adminAuth, (req, res) => {
    let sql = `
        select * from places
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            success: true,
            message: 'Success retrieve data from database',
            data: result
        })
    })
})

/************** GET BOOTH BY ID ***************/
app.get('/adm/booth/:id', adminAuth, (req, res) => {
    let sql = `
        select * from places
        where id = `+req.params.id+`
        limit 1
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "Success Getting Booth Details",
            data: result[0]
        })
    })
})

/************** ADD booth ***************/
app.post('/adm/booth/add', adminAuth, (request, result) => {
    let data = request.body

    let sql = `
        insert into places (alamat, status)
        values ('`+data.alamat+`', '`+data.status+`');
    `

    db.query(sql, (err, result) => {
        if (err) throw err
    })

    result.json({
        success: true,
        message: 'Booth Added!'
    })
})

/************** UPDATE ROOMS ***************/
app.put('/adm/booth/:id', adminAuth, (request, result) => {
    let data = request.body

    let sql = `
        update places
        set alamat = '`+data.alamat+`', status = '`+data.status+`'
        where id = `+request.params.id+`
    `

    db.query(sql, (err, result) => {
        if (err) throw err
    })

    result.json({
        success: true,
        message: 'Room Succesfully Updated!'
    })
})

/************** GET ALL USER ***************/
app.get('/adm/user', adminAuth, (req, res) => {
    let sql = `
        select * from user
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            success: true,
            message: 'Success Retrieving all user!',
            data: result
        })
    })
})

/************** DELETE ROOM BY ID ***************/
app.delete('/adm/booth/:id/delete', adminAuth, (request, result) => {
    let sql = `
        delete from places where id = `+request.params.id+`
    `

    db.query(sql, (err, res) => {
        if (err) throw err
    })

    result.json({
        success: true,
        message: 'Data deleted!'
    })
})


/************** PORT ***************/
app.listen(1337, () => {
    console.log('App is running on port 1337!')
})
