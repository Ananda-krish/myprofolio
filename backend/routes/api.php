<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\NavbarTemplateController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\SectionController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('auth/login', [AuthController::class, 'login']);

    // Public read-only routes
    Route::get('public/portfolios/{id}', [PublicController::class, 'portfolio']);
    Route::get('public/portfolios/{portfolioId}/pages/{pageId}', [PublicController::class, 'page']);
    Route::get('public/portfolios/{portfolioId}/pages/by-slug/{slug}', [PublicController::class, 'pageBySlug']);
    Route::get('public/portfolios/{id}/menus', [PublicController::class, 'menus']);
    Route::get('public/portfolios/{id}/navbar-template', [PublicController::class, 'navbarTemplate']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);

        Route::get('pages', [PageController::class, 'index']);

        Route::patch('menus/reorder', [MenuController::class, 'reorder']);
        Route::apiResource('menus', MenuController::class);

        Route::post('media', [MediaController::class, 'store']);

        Route::apiResource('portfolios', PortfolioController::class);

        Route::patch('portfolios/{portfolio}/pages/reorder', [PageController::class, 'reorder']);
        Route::apiResource('portfolios.pages', PageController::class);

        Route::post('portfolios/{portfolio}/pages/{page}/model', [PageController::class, 'uploadModel']);
        Route::patch('portfolios/{portfolio}/pages/{page}/model', [PageController::class, 'updateModelConfig']);
        Route::delete('portfolios/{portfolio}/pages/{page}/model', [PageController::class, 'deleteModel']);

        Route::patch('portfolios/{portfolio}/pages/{page}/sections/reorder', [SectionController::class, 'reorder']);
        Route::apiResource('portfolios.pages.sections', SectionController::class);

        Route::apiResource('navbar-templates', NavbarTemplateController::class);
    });
});
