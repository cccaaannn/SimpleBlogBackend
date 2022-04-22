// Project imports
import EmailVerificationService from './email-verificaiton.service';
import EncryptionService from '../core/services/encryption.service';
import JWTService from '../core/services/jwt.service';
import UserService from './user.service';

import { IDataResult, DataResult, ErrorDataResult, SuccessDataResult } from '../core/results/DataResult';
import { ErrorResult, IResult, SuccessResult } from '../core/results/Result';
import { Login } from '../core/types/Login';
import { Token } from '../core/types/Token';
import { SignUp } from '../core/types/SignUp';
import { TokenPayload } from '../core/types/TokenPayload';

import Status from '../types/enums/Status';
import { User, UserAdd } from '../types/User';


async function login(login: Login): Promise<IDataResult<Token | null>> {
    const userResult: DataResult<User | null> = await UserService.getByUsername(login.username);

    if (userResult == null || userResult.data == null || !userResult.status) {
        return new ErrorDataResult(null, "Login failed");
    }

    if (userResult.data.status == Status.PASSIVE) {
        return new ErrorDataResult(null, "User is pending fpr activation");
    }

    if (userResult.data.status == Status.SUSPENDED) {
        return new ErrorDataResult(null, "User is suspended");
    }

    const user: User = userResult.data;
    if (!await EncryptionService.compare(login.password, user.password)) {
        return new ErrorDataResult(null, "Login failed");
    }

    const tokenPayload: TokenPayload = {
        id: user._id + "",
        status: user.status,
        username: user.username,
        email: user.email,
        role: user.role
    }

    const token: Token = JWTService.generateToken(tokenPayload);

    return new SuccessDataResult(token)
}


async function signUp(signUp: SignUp): Promise<IResult> {

    // build user model
    const user: UserAdd = {
        email: signUp.email,
        username: signUp.username,
        password: signUp.password
    }

    // try to add user
    const userAddResult: IDataResult<User | null> = await UserService.add(user);
    if (userAddResult == null || userAddResult.data == null || !userAddResult.status) {
        return new ErrorResult(userAddResult.message);
    }

    // async email sent
    EmailVerificationService.sendVerificationEmail(userAddResult.data._id);

    return new SuccessResult(`Email sent to ${signUp.email}`);
}

async function sendVerification(email: string): Promise<IResult> {
    // Get user information
    const userResult: DataResult<User | null> = await UserService.getByEmail(email);
    if (userResult == null || userResult.data == null || !userResult.status) {
        return new ErrorResult("User not exists");
    }
    
    // Prevent unnecessary email sending
    if(userResult.data.status == Status.ACTIVE) {
        return new ErrorResult("User is already active");
    }

    // async email sent
    EmailVerificationService.sendVerificationEmail(userResult.data._id);

    return new SuccessResult(`Email sent to ${email}`);
}

async function verify(token: Token): Promise<IResult> {

    // verify token
    const verificationResult: IDataResult<TokenPayload | null> = await JWTService.verify(token);
    if (verificationResult == null || verificationResult.data == null || !verificationResult.status) {
        return new ErrorResult("Account verification failed");
    }

    // get payload
    const tokenPayload: TokenPayload = verificationResult.data;

    // get user using id from payload
    const userResult: DataResult<User | null> = await UserService.getById(tokenPayload.id);
    if (userResult == null || userResult.data == null || !userResult.status) {
        return new ErrorResult("Account verification failed");
    }

    // fail if already active
    if (userResult.data.status == Status.ACTIVE) {
        return new ErrorResult("Account is already active");
    }

    // activate users account
    const userActivationResult: IResult = await UserService.activate(tokenPayload.id);
    if (!userActivationResult.status) {
        return new ErrorResult("Account activation failed");
    }

    return new SuccessResult("Account successfully activated")
}


// ---------- ---------- business rules ---------- ----------


// ---------- ---------- ---------- ---------- ----------


const AuthService = { login, signUp, sendVerification, verify };
export default AuthService;

