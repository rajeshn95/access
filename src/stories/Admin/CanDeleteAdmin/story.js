const validator = requireValidator();
const adminRepo = requireRepo("admin");
const tokensRepo = requireRepo("tokens");
const findKeysFromRequest = requireUtil("findKeysFromRequest");

const prepare = ({ reqQuery, reqBody, reqParams, req }) => {
  const payload = findKeysFromRequest(req, ["admin_uuid"]);
  payload["jti"] = req.jti;
  return payload;
};

const authorize = async ({ prepareResult }) => {
  let unauthorizedObject = {
    statusCode: 401,
    message: "Unauthorized",
  };

  try {
    if (prepareResult.jti !== undefined) {
      let token = await tokensRepo.first({
        uuid: prepareResult.jti,
      });
      if (token["issuer"] === "admin") {
        let isSuperUser = await adminRepo.isSuperUser(token.sub);
        if (isSuperUser) {
          return token;
        } else {
          throw unauthorizedObject;
        }
      } else {
        throw unauthorizedObject;
      }
    } else {
      throw unauthorizedObject;
    }
  } catch (error) {
    throw error;
  }
};

const handle = async ({ prepareResult, authorizeResult }) => {
  try {
    let adminUuid = prepareResult.admin_uuid;
    return await adminRepo.deleteAdmin(adminUuid);
  } catch (error) {
    throw error;
  }
};

const respond = async ({ handleResult }) => {
  try {
    return handleResult;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  prepare,
  authorize,
  handle,
  respond,
};
