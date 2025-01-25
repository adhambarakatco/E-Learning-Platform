import { Body, Controller, Get, Post, Req, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Response , Request } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginUserDTO } from '../users/loginUser.dto';
import { CreateUserDTO } from '../users/CreateUser.dto';
import { AuthGuard } from './auth.guard'
import { Public } from './public.decorator';


@Controller('auth')
export class AuthController {

    constructor(private readonly AuthService:AuthService,
        private readonly UsersService:UsersService
    ){}
    @Public()
    @Post('login')
    @UsePipes(new ValidationPipe())
    async login(@Body() loginCreds: LoginUserDTO, @Res() res: Response) {
        const result = await this.AuthService.authenticateLogin(loginCreds, res);
        return res.json(result);
    }
    @Public()
    @Post('register')
    @UsePipes(new ValidationPipe())
    async register(@Body() userData:CreateUserDTO){
        return await this.AuthService.register(userData)
        
    }
    @UseGuards(AuthGuard)
    @Get('userData')
    async test(@Req() req , @Res() res){
        const user = await this.UsersService.getUserById(req.user.sub)
        return  res.json(user)
    }
    @UseGuards(AuthGuard)
    @Post('logout')
    async logout(@Res() res: Response) {
        await this.AuthService.logout(res);
    }

    
}
