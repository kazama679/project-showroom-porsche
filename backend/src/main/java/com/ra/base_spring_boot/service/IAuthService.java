package com.ra.base_spring_boot.service;

import com.ra.base_spring_boot.dto.request.FormLogin;
import com.ra.base_spring_boot.dto.request.FormRegister;
import com.ra.base_spring_boot.dto.request.VerifyOtpRequest;
import com.ra.base_spring_boot.dto.response.JwtResponse;

public interface IAuthService
{

    void register(FormRegister formRegister);

    JwtResponse login(FormLogin formLogin);

    void verifyOtp(VerifyOtpRequest request);

    void resendOtp(String email);

}
