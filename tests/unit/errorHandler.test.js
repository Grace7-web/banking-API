const errorHandler = require("../../middlewares/errorHandler");

describe("errorHandler middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn();
  });

  it("doit gérer une erreur par défaut", () => {
    const err = new Error("Erreur générique");

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: "Erreur générique"
    }));
  });

  it("doit utiliser statusCode et message de l'erreur", () => {
    const err = new Error("Non trouvé");
    err.statusCode = 404;

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: "Non trouvé"
    }));
  });

  it("doit inclure le stack en mode développement", () => {
    process.env.NODE_ENV = "development";
    const err = new Error("Erreur");
    err.stack = "Error stack trace";

    errorHandler(err, req, res, next);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      stack: "Error stack trace"
    }));

    delete process.env.NODE_ENV;
  });

  it("ne doit pas inclure le stack en mode production", () => {
    process.env.NODE_ENV = "production";
    const err = new Error("Erreur");
    err.stack = "Error stack trace";

    errorHandler(err, req, res, next);

    expect(res.json).not.toHaveBeenCalledWith(expect.objectContaining({
      stack: expect.anything()
    }));

    delete process.env.NODE_ENV;
  });

  it("doit gérer une erreur sans message ni statusCode", () => {
    const err = {};

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: "Erreur interne du serveur"
    }));
  });
});
