<?php

namespace App\Http\Middleware;

use App\Utils\ResultResponse;
use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\TransientToken;
use Symfony\Component\HttpFoundation\Response;

class EnforceDevicePolicy
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!config('device_policy.enabled', false)) {
            return $next($request);
        }

        $token = $request->user()?->currentAccessToken();
        if (!$token) {
            return $next($request);
        }
        if ($token instanceof TransientToken) {
            return $next($request);
        }

        $deviceId = $request->header('X-Device-Id');
        $deviceClass = $request->header('X-Device-Class');

        if (config('device_policy.require_headers', true)) {
            if (!$deviceId) {
                return ResultResponse::error(
                    message: 'device id required',
                    code: 'DEVICE_ID_REQUIRED',
                    status: 400
                )->toResponse($request);
            }
            if (!$deviceClass) {
                return ResultResponse::error(
                    message: 'device class required',
                    code: 'DEVICE_CLASS_REQUIRED',
                    status: 400
                )->toResponse($request);
            }
        }

        if (!$deviceId || !$deviceClass) {
            return $next($request);
        }

        $deviceClass = strtolower(trim($deviceClass));
        if (!in_array($deviceClass, ['mobile', 'desktop'], true)) {
            return ResultResponse::error(
                message: 'invalid device class',
                code: 'DEVICE_CLASS_INVALID',
                status: 400
            )->toResponse($request);
        }

        $tokenName = (string) $token->name;
        $expectedPrefix = "device:{$deviceClass}:";
        if (!str_starts_with($tokenName, $expectedPrefix)) {
            return ResultResponse::error(
                message: 'device not authorized',
                code: 'DEVICE_NOT_AUTHORIZED',
                status: 403
            )->toResponse($request);
        }

        $tokenDeviceId = substr($tokenName, strlen($expectedPrefix));
        if (!hash_equals($tokenDeviceId, (string) $deviceId)) {
            return ResultResponse::error(
                message: 'device mismatch',
                code: 'DEVICE_MISMATCH',
                status: 403
            )->toResponse($request);
        }

        return $next($request);
    }
}
