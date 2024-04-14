


GOOGLE AUTH FRONTEND SIDE

```js

const login = ()=>{
    const loginThtoughGoogle = () =>{
        window.open("http://localhost:4000/auth/google/callback","_self")
    }
    return (
        <>
<div>
    <form>
        <input type="text" placeholder ="enter your name">

    </form>
    <button onclick(loginThtoughGoogle)>
</div>
        </>
    )
}

```