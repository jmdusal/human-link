# FROM php:8.3-fpm
FROM php:8.4-fpm

ARG UID=1000
ARG GID=1000

# Set working directory
WORKDIR /var/www

# dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

RUN groupadd -g ${GID} devuser || true && \
    useradd -u ${UID} -g ${GID} -m -s /bin/bash devuser

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

COPY --chown=devuser:devuser . /var/www
# existing application directory permissions
# COPY . /var/www
# RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

USER devuser

EXPOSE 9000
CMD ["php-fpm"]
