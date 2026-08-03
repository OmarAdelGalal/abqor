<?php

namespace App\Exceptions;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Validation\ValidationException;
use Throwable;
use App\Utils\ResultResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Validation\UnauthorizedException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class Handler extends ExceptionHandler
{
    /**
     * A list of exception types with their corresponding custom log levels.
     *
     * @var array<class-string<\Throwable>, \Psr\Log\LogLevel::*>
     */
    protected $levels = [
        //
    ];

    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<\Throwable>>
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->renderable(function (ValidationException $e,$request) {
            return ResultResponse::validationError($e->errors())->toResponse($request);
        });
        
        //handle unauthorized exception
        $this->renderable(function (UnauthorizedException $e, $request) {
            return ResultResponse::error(code: 'UNAUTHORIZED', message: 'unauthorized', status: 401)->toResponse($request);
        });
        
        // handle AuthenticationException
        $this->renderable(function (AuthenticationException $e, $request) {
            return ResultResponse::error(code: 'AUTHENTICATION_ERROR', message: 'authentication error', status: 401)->toResponse($request);
        });

        // API-friendly exceptions (do not convert web 404 pages into JSON).
        $this->renderable(function (ModelNotFoundException $e, $request) {
            if (!$request->expectsJson() && !$request->is('api/*')) {
                return null;
            }

            return ResultResponse::error(code: 'NOT_FOUND', message: 'not found', status: 404)->toResponse($request);
        });

        $this->renderable(function (AuthorizationException $e, $request) {
            if (!$request->expectsJson() && !$request->is('api/*')) {
                return null;
            }

            return ResultResponse::error(code: 'UNAUTHORIZED', message: 'unauthorized', status: 401)->toResponse($request);
        });
        
        // Handle remaining exceptions for APIs, preserving HTTP status codes (404/405/etc).
        $this->renderable(function (Throwable $e, $request) {
            if (!$request->expectsJson() && !$request->is('api/*')) {
                return null;
            }

            if ($e instanceof HttpExceptionInterface) {
                $status = (int) $e->getStatusCode();
                if ($status === 404) {
                    return ResultResponse::error(code: 'NOT_FOUND', message: 'not found', status: 404)->toResponse($request);
                }
                if ($status === 405) {
                    return ResultResponse::error(code: 'METHOD_NOT_ALLOWED', message: 'method not allowed', status: 405)->toResponse($request);
                }

                return ResultResponse::error(code: 'HTTP_ERROR', message: 'error', status: $status)->toResponse($request);
            }

            return ResultResponse::serverError((string) $e)->toResponse($request);
        });
    }
    public function render($request, Throwable $e)
    {
        $wantsJson = $request->expectsJson() || $request->is('api/*');

        //render not found exception
        if ($wantsJson && $e instanceof ModelNotFoundException) {
            return ResultResponse::error(code: 'NOT_FOUND', message: 'not found', status: 404)->toResponse($request);
        }
        if ($wantsJson && $e instanceof AuthorizationException) {
            return ResultResponse::error(code: 'UNAUTHORIZED', message: 'unauthorized', status: 401)->toResponse($request);

        }
        return parent::render($request, $e);
    }
}
