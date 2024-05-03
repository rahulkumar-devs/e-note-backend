     

<!-- user Role -->

### User Role

1. Admin 🎓
2. sub-Admin 🪖
3. Editor 📍
4. User 🧑‍🤝‍🧑

## User Role Properties

#### Admin



1. All routes can be accessed
2. Admin can perform CRUD operations on Permission
3. CRUD on user with their role (sub-Amin ,editor,user) and permission.
4. Admin can add / delete / update / the permission to all section (User Permissions , Post, categories, Comments, likes)
5. CRUD on Post , Categories,Comments,Likes.


#### Sub Admin
1. Sub Admin can access all routes but not admin routes.
2. sub admin can add/delete/update the permission to all section if he has permission from the Admin user .
3. CRUD on user with their roles (editor,user) and permission but not to self
4. CRUD on post ,categories, comments,and likes , if he has permission from the admin User.

#### Editor
1. The editor can access all routes but not the admin & sub admin routes
2. The editor can perform CRUD on post , Categories , Comments,and Likes if he has permission from the Admin or sub Admin user.


#### User
1. User can register & login
2. user can see the post 
3. comment and Likes are default enabled from normal users, but the admin and sub-admin can block their comments and likes features.







``` js
 const files = req.files as { [fieldname: string]: Express.Multer.File[] };
```


 --- 
### Feature of blogs

1. `Likes/Reactions`: You can add a field to track the number of likes or reactions a post receives from users.
2. `Views/Reads`: You can add a field to track the number of views or reads a post has.
3. `Featured Post`: You can add a field to mark certain posts as featured or highlight them in some way.
4. `Post Status`: You can add a field to indicate the status of a post (e.g., draft, published, archived).
5. `Post Excerpt`: You can add a field to store a short excerpt or summary of the post content.
6. `Post URL`: You can add a field to store a URL slug for the post, which can be used for SEO-friendly URLs.
7. `Post Metadata`: You can add fields to store additional metadata about the post, such as keywords, author bio, or publication date.
8. `Post Privacy`: You can add a field to indicate the privacy settings of the post (e.g., public, private, members-only).
9. `Post Comments Settings`: You can add fields to configure comment settings for the post, such as allowing/disallowing comments, comment moderation, etc.
