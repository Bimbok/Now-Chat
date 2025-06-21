# Simple Chatting App

## Technologies Used

-   **Backend:** Node.js, Express.js
-   **Database:** MongoDB with Mongoose
-   **Templating Engine:** EJS (Embedded JavaScript)
-   **Security:** bcrypt, dotenv
-   **Other:** body-parser

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) installed
-   [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally

### Installation

1.  **Clone the repository** (if you are working with git)
    ```sh
    git clone https://github.com/Bimbok/Now-Chat.git
    cd myMy
    ```

2.  **Install NPM packages**
    ```sh
    npm install
    ```

3.  **Create an environment file**
    Create a `.env` file in the root of your project and add your MongoDB connection string.
    ```
    MONGO_URI='mongodb://127.0.0.1/nowChat'
    ```

4.  **Start the server**
    ```sh
    node app.js
    ```
    or

    ```sh
    npm run dev
    ```

    The application will be running on `http://localhost:3000`.

## Usage

-   Navigate to `http://localhost:3000/register` to create a new user account.
-   Navigate to `http://localhost:3000/login` to log in with your credentials.


### **Note:** Currently development phases