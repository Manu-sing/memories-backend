const jwt = require("jsonwebtoken");
const logger = require("./logger");

const requestLogger = (request, response, next) => {
  logger.info("Method:", request.method);
  logger.info("Path:  ", request.path);
  logger.info("Body:  ", request.body);
  logger.info("---");

  next();
};

const errorHandler = (error, request, response, next) => {
  logger.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const isCustomAuth = token.length < 500;

    let decodedToken;

    if (token && isCustomAuth) {
      decodedToken = jwt.verify(token, process.env.SECRET);
      req.userId = decodedToken.id;
    } else {
      decodedToken = jwt.decode(token, process.env.SECRET);
      req.googleId = decodedToken.sub;
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: "token missing or invalid" });
  }
  // let token;
  // const authorization = req.get("authorization");
  // if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
  //   token = authorization.split(" ")[1];
  // }

  // if (!token) {
  //   return res.status(401).json({ error: "token missing" });
  // }
  // // meaning that this should be the custom token received from the FE
  // if (token.lenght < 500) {
  //   try {
  //     const decoded = jwt.verify(token, process.env.SECRET);
  //     req.user = decoded;
  //     next();
  //   } catch (error) {
  //     return res.status(400).json({ error: "token invalid" });
  //   }
  //   // meaning that this should be the google firebase generated token from the FE
  // } else {
  //   try {
  //     const decoded = jwt.decode(token, process.env.SECRET);
  //     console.log(decoded);
  //     req.user = decoded;
  //     next();
  //   } catch (error) {
  //     return res.status(400).json({ error: "token invalid" });
  //   }
  // }
};

module.exports = {
  errorHandler,
  unknownEndpoint,
  requestLogger,
  auth,
};
