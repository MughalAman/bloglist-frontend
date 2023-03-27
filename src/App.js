import { useState, useEffect } from "react";
import Blog from "./components/Blog";
import blogService from "./services/blogs";
import loginService from "./services/login";

const Notification = ({ message }) => {
  if (message === null) {
    return null
  }

  return (
    <div style={{padding: "0.2em", fontSize:"1.5em", borderStyle:"solid"}}>
      {message}
    </div>
  )
}


const App = () => {
  const [blogs, setBlogs] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null)
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogAuthor, setBlogAuthor] = useState("");
  const [blogUrl, setBlogUrl] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const user = await loginService.login({
        username, password,
      })

      window.localStorage.setItem(
        'loggedUser', JSON.stringify(user)
      )
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setErrorMessage('wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem('loggedUser')
    setUser(null)
  }

  const handleCreate = (event) => {
    event.preventDefault();

    if (blogTitle === "" || blogAuthor === "" || blogUrl === "") {
      setErrorMessage("error - empty fields");
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
      return;
    }

    const newBlog = {
      title: blogTitle,
      author: blogAuthor,
      url: blogUrl
    };

   const response = blogService.create(newBlog).then((returnedBlog) => {
      setBlogs(blogs.concat(returnedBlog));
    });

    if (response) {
      setErrorMessage(`a new blog ${blogTitle} by ${blogAuthor} added`);
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    }else {
      setErrorMessage("error");
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    }

    setBlogTitle("");
    setBlogAuthor("");
    setBlogUrl("");
  };

  useEffect(() => {
    blogService.getAll().then((blogs) => setBlogs(blogs));
  }, []);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, []);

  return (
    <div>
      {user === null ? (
        <div>
          <h2>Log in</h2>
          <Notification message={errorMessage} />
          <form>
            <div style={{display:"flex", flexDirection:"column", width:"25%", gap:"1em"}}>
              <input placeholder="Username" onChange={(e) => {setUsername(e.target.value)}}></input>
              <input type="password" placeholder="Password" onChange={(e) => {setPassword(e.target.value)}}></input>
              <button type="submit" onClick={(e) => {handleLogin(e)}}>login</button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          <h2>Blogs</h2>
          <Notification message={errorMessage} />
          <div style={{display:"flex", flexDirection:"row", gap:"1em"}}>
          <p>{user.name} logged in</p>
          <button onClick={handleLogout} style={{height:"2em", alignSelf:"center"}}>logout</button>
          </div>

          <div>
            <h2>Create new</h2>
            <form>
              <div style={{display:"flex", flexDirection:"column", width:"25%", gap:"1em"}}>
                <input placeholder="Title" onChange={(e) => {setBlogTitle(e.target.value)}}></input>
                <input placeholder="Author" onChange={(e) => {setBlogAuthor(e.target.value)}}></input>
                <input placeholder="URL" onChange={(e) => {setBlogUrl(e.target.value)}}></input>
                <button type="submit" onClick={(e) => {handleCreate(e)}}>create</button>
              </div>
            </form>
          </div>

          {blogs.map((blog) => (
            <Blog key={blog.id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
