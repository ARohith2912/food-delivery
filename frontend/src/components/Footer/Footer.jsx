import "./Footer.css";

function Footer() {

    return (

        <footer className="footer">

            <div className="footer-container">

                <div className="footer-section">

                    <h2>Food Delivery</h2>

                    <p>
                        Delicious food delivered to your doorstep.
                    </p>

                </div>

                <div className="footer-section">

                    <h3>Quick Links</h3>

                    <ul>

                        <li>Home</li>

                        <li>Restaurants</li>

                        <li>Cart</li>

                        <li>Orders</li>

                    </ul>

                </div>

                <div className="footer-section">

                    <h3>Contact</h3>

                    <p>Email : support@fooddelivery.com</p>

                    <p>Phone : +91 9876543210</p>

                </div>

            </div>

            <hr />

            <p className="copyright">

                © 2026 Food Delivery. All Rights Reserved.

            </p>

        </footer>

    );

}

export default Footer;