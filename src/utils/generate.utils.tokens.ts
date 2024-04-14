import UserModel from "../models/user.model";

interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}

const generateAccessAndRefreshToken = async (userId: string): Promise<TokenResponse> => {
    const user = await UserModel.findById(userId);
    
    if (!user) {
        throw new Error("User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
}

export default generateAccessAndRefreshToken;
