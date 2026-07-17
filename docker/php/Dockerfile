# Note: Using linux/amd64 because libsql_php extension only supports x86_64 Linux
FROM --platform=linux/amd64 php:8.3

# ユーザーとグループのIDを指定
# ※ Linuxの一般ユーザーのデフォルトのID
ARG UID=1000
ARG GID=1000

# www-data ユーザーのUIDとGIDを変更
RUN usermod -u $UID www-data && groupmod -g $GID www-data

COPY ./docker/php/php.ini /usr/local/etc/php/php.ini

# Composer install
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# install Node.js
COPY --from=node:latest /usr/local/bin /usr/local/bin
COPY --from=node:latest /usr/local/lib /usr/local/lib

RUN apt-get update && \
    apt-get -y install \
    git \
    zip \
    unzip \
    vim \
    libpq-dev \
    curl \
    && docker-php-ext-install pdo_mysql pdo_pgsql pgsql bcmath

RUN chown -R www-data:www-data /var/www/html
RUN mkdir -p /var/www/html/storage && \
    chmod -R 775 /var/www/html/storage

RUN mkdir -p /var/www/html/bootstrap/cache && \
    chmod -R 775 /var/www/html/bootstrap/cache
WORKDIR /var/www/html
