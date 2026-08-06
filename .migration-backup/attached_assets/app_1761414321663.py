
from flask import Flask
from controllers.ai_controller import bp as ai_bp
from controllers.fit_controller import bp as fit_bp
from controllers.recommend_controller import bp as rec_bp
from controllers.quickbuy_controller import bp as qb_bp
from controllers.maker_controller import bp as maker_bp
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.register_blueprint(ai_bp, url_prefix="/api/v1")
    app.register_blueprint(fit_bp, url_prefix="/api/v1")
    app.register_blueprint(rec_bp, url_prefix="/api/v1")
    app.register_blueprint(qb_bp, url_prefix="/api/v1")
    app.register_blueprint(maker_bp, url_prefix="/api/v1")
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=8080, debug=True)
