export const authorize = (role) => {
    return (req, res, next) => {
        //console.log("req.user: ", req.user);
        //console.log("role: ", role);
        if (req.user && req.user.role === role) {
            return next();
        }
        res.status(403).json({ message: 'Forbidden' });
    };
};
