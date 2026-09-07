const CACHE_NAME =
    "quiz-cache-v1";


const STATIC_FILES = [

    "./",

    "./index.html",

    "./banks.json",

    "./manifest.json",

    "./icons/icon_192.png",

    "./icons/icon_512.png"

];


/*
 * 安装
 */

self.addEventListener(

    "install",

    event => {


        event.waitUntil(

            caches
                .open(
                    CACHE_NAME
                )

                .then(

                    cache =>
                        cache.addAll(
                            STATIC_FILES
                        )

                )

        );


        self.skipWaiting();

    }

);


/*
 * 激活
 *
 * 删除旧版本缓存
 */

self.addEventListener(

    "activate",

    event => {


        event.waitUntil(

            caches
                .keys()

                .then(

                    keys =>

                        Promise.all(

                            keys.map(

                                key => {

                                    if (
                                        key !==
                                        CACHE_NAME
                                    ) {

                                        return caches
                                            .delete(
                                                key
                                            );

                                    }

                                }

                            )

                        )

                )

        );


        self.clients.claim();

    }

);


/*
 * 网络请求
 *
 * 优先访问网络
 *
 * 网络失败时使用缓存
 */

self.addEventListener(

    "fetch",

    event => {


        /*
         * 只处理 GET
         */

        if (
            event.request.method
            !== "GET"
        ) {

            return;

        }


        event.respondWith(


            fetch(
                event.request
            )


            .then(

                response => {


                    /*
                     * 无效响应不缓存
                     */

                    if (
                        !response ||
                        response.status !== 200
                    ) {

                        return response;

                    }


                    /*
                     * 克隆
                     */

                    const clonedResponse =
                        response.clone();


                    /*
                     * 保存到缓存
                     */

                    caches
                        .open(
                            CACHE_NAME
                        )

                        .then(

                            cache => {

                                cache.put(

                                    event.request,

                                    clonedResponse

                                );

                            }

                        );


                    return response;

                }

            )


            /*
             * 网络失败
             */

            .catch(

                () =>

                    caches.match(
                        event.request
                    )

            )


        );

    }

);
