/* =========================================================
   UI helpers: ไอคอน, header/footer, modal, toast, การ์ดร้าน, avatar
   ========================================================= */
(function () {
  /* ไอคอน: ส่วนใหญ่ดึงจาก Figma (หน้า Icons 19:2 + หน้าโปรไฟล์ 406:2632) — รูปแบบ [viewBox, path]
     ที่เหลือ (string) เป็นไอคอนเดิมบนกริด 24×24 สำหรับสิ่งที่ Figma ไม่มี */
  const P = {
    utensils: ['0 0 46 52', 'M7.7 51V27.7C5.4 27.1 3.5 25.9 2.1 24.1C0.7 22.2 0 20.2 0 17.9V0H5.1V15.3H7.7V0H12.8V15.3H15.3V0H20.4V17.9C20.4 20.2 19.7 22.2 18.3 24.1C16.9 25.9 15.1 27.1 12.8 27.7V51H7.7ZM33.2 51V26.7C30.9 26 29 24.4 27.6 21.9C26.2 19.5 25.5 16.7 25.5 13.6C25.5 9.8 26.5 6.6 28.5 4C30.5 1.3 32.9 0 35.7 0C38.5 0 40.9 1.3 42.9 4C44.9 6.6 45.9 9.9 45.9 13.7C45.9 16.8 45.2 19.5 43.8 21.9C42.4 24.4 40.6 26 38.3 26.7V51H33.2Z'],
    users: ['0 0 57 45', 'M28.4 0C33.5 0 37.6 4.4 37.6 9.9C37.6 15.3 33.5 19.8 28.4 19.8C23.3 19.8 19.2 15.3 19.2 9.9C19.2 4.4 23.3 0 28.4 0ZM8.5 6.8C12.1 6.8 14.9 9.9 14.9 13.7C14.9 17.5 12.1 20.5 8.5 20.5C5 20.5 2.1 17.5 2.1 13.7C2.1 9.9 5 6.8 8.5 6.8ZM0 38C0 31.3 5.1 25.9 11.4 25.9C12.5 25.9 13.6 26 14.6 26.4C11.7 29.9 9.9 34.5 9.9 39.5V41.1C9.9 42.1 10.2 43.2 10.5 44.1H2.8C1.3 44.1 0 42.7 0 41.1V38ZM46.3 44.1C46.7 43.2 46.9 42.1 46.9 41.1V39.5C46.9 34.5 45.1 29.9 42.2 26.4C43.2 26 44.3 25.9 45.5 25.9C51.7 25.9 56.8 31.3 56.8 38V41.1C56.8 42.7 55.6 44.1 54 44.1H46.3ZM41.9 13.7C41.9 9.9 44.8 6.8 48.3 6.8C51.8 6.8 54.7 9.9 54.7 13.7C54.7 17.5 51.8 20.5 48.3 20.5C44.8 20.5 41.9 17.5 41.9 13.7ZM14.2 39.5C14.2 31.1 20.6 24.3 28.4 24.3C36.3 24.3 42.6 31.1 42.6 39.5V41.1C42.6 42.7 41.4 44.1 39.8 44.1H17C15.5 44.1 14.2 42.7 14.2 41.1V39.5Z'],
    heart: ['0 0 50 44', 'M23.3 5.3L24.8 7.3L26.3 5.3C28.7 2 32.6 0 36.7 0C43.8 0 49.6 5.8 49.6 12.9V13.1C49.6 24 36 36.6 29 42C27.8 42.9 26.3 43.4 24.8 43.4C23.3 43.4 21.8 43 20.6 42C13.6 36.6 0 24 0 13.1V12.9C0 5.8 5.8 0 12.9 0C17 0 20.9 2 23.3 5.3Z'],
    heartOutline: ['0 0 108 95', 'M79.9 10.2C74.2 10.2 68.7 13 65.4 17.6L58.1 27.7C57.2 29.1 55.6 29.8 54 29.8C52.4 29.8 50.9 29.1 49.9 27.7L42.7 17.6C39.3 13 33.9 10.2 28.1 10.2C18.2 10.2 10.2 18.3 10.2 28.2C10.2 38.8 16.9 49.1 24.5 58.4C33.2 69 43.8 78.4 51.1 83.9C51.8 84.4 52.8 84.8 54 84.8C55.3 84.8 56.3 84.4 57 83.9C64.3 78.4 74.9 69 83.6 58.4C91.2 49.1 97.9 38.8 97.9 28.2C97.9 18.3 89.9 10.2 80 10.2H79.9ZM57.2 11.7C62.4 4.3 70.9 0 79.9 0C95.4 0 108 12.6 108 28.2C108 42.8 99 55.6 91.3 64.9C82 76.3 70.8 86.1 63.1 92C60.5 94 57.3 95 54 95C50.7 95 47.5 94 44.9 92C37.2 86.1 26 76.3 16.7 64.9C9 55.6 0 42.8 0 28.2C0 12.6 12.6 0 28.1 0C37.1 0 45.6 4.3 50.8 11.7L54 16.1L57.2 11.7Z'],
    pin: ['0 0 37 50', 'M0 18.3C0 8.2 8.2 0 18.3 0C28.4 0 36.6 8.2 36.6 18.3C36.6 29.8 25.2 43.7 20.4 49C19.2 50.2 17.4 50.2 16.2 49C11.5 43.7 0 29.8 0 18.3H0ZM18.3 24.8C21.7 24.8 24.4 22 24.4 18.6C24.4 15.2 21.7 12.4 18.3 12.4C14.9 12.4 12.2 15.2 12.2 18.6C12.2 22 14.9 24.8 18.3 24.8Z'],
    face: ['0 0 49 50', 'M0 24.8C0 11.1 10.9 0 24.4 0C37.9 0 48.8 11.1 48.8 24.8C48.8 38.5 37.9 49.6 24.4 49.6C10.9 49.6 0 38.5 0 24.8ZM19.8 20.1C19.8 18.4 18.5 17.1 16.8 17.1C15.1 17.1 13.7 18.4 13.7 20.1C13.7 21.9 15.1 23.3 16.8 23.3C18.5 23.3 19.8 21.9 19.8 20.1ZM32 23.3C33.7 23.3 35.1 21.9 35.1 20.1C35.1 18.4 33.7 17.1 32 17.1C30.3 17.1 29 18.4 29 20.1C29 21.9 30.3 23.3 32 23.3Z'],
    paw: ['0 0 50 44', 'M22.7 5.9C24.1 10.1 22.7 14.2 19.5 15.3C16.4 16.3 12.8 13.8 11.4 9.6C10 5.4 11.4 1.3 14.5 0.2C17.7-0.8 21.3 1.7 22.7 5.9ZM9.7 16.1C11.5 19.3 11.1 22.9 8.7 24.3C6.4 25.6 2.9 24.2 1.1 21.1C-0.7 17.9-0.3 14.3 2.1 12.9C4.5 11.6 7.9 13 9.7 16.1ZM6.7 35.8C11.8 22.1 20.8 18.6 24.8 18.6C28.8 18.6 37.8 22.1 42.9 35.8C43.2 36.7 43.4 37.7 43.4 38.7V38.9C43.4 41.4 41.4 43.4 38.9 43.4C37.8 43.4 36.6 43.3 35.6 43L27 40.9C25.6 40.5 24 40.5 22.5 40.9L14 43C12.9 43.3 11.8 43.4 10.7 43.4C8.2 43.4 6.2 41.4 6.2 38.9V38.7C6.2 37.7 6.3 36.7 6.7 35.8ZM40.9 24.3C38.5 22.9 38 19.3 39.9 16.1C41.7 13 45.1 11.6 47.5 12.9C49.8 14.3 50.3 17.9 48.5 21.1C46.6 24.2 43.2 25.6 40.9 24.3ZM30 15.3C26.9 14.2 25.5 10.1 26.9 5.9C28.3 1.7 31.9-0.8 35 0.2C38.2 1.3 39.6 5.4 38.2 9.6C36.8 13.8 33.2 16.3 30 15.3Z'],
    plus: ['0 0 39 39', 'M22 2.8C22 1.2 20.8 0 19.3 0C17.7 0 16.5 1.2 16.5 2.8V16.5H2.8C1.2 16.5 0 17.7 0 19.3C0 20.8 1.2 22 2.8 22H16.5V35.8C16.5 37.3 17.7 38.5 19.3 38.5C20.8 38.5 22 37.3 22 35.8V22H35.8C37.3 22 38.5 20.8 38.5 19.3C38.5 17.7 37.3 16.5 35.8 16.5H22V2.8Z'],
    image: ['0 0 39 41', 'M4.3 40.5C3.1 40.5 2.1 40.1 1.3 39.2C0.4 38.3 0 37.2 0 36V4.5C0 3.3 0.4 2.2 1.3 1.3C2.1 0.4 3.1 0 4.3 0H34.7C35.9 0 36.9 0.4 37.7 1.3C38.6 2.2 39 3.3 39 4.5V36C39 37.2 38.6 38.3 37.7 39.2C36.9 40.1 35.9 40.5 34.7 40.5H4.3ZM4.3 36H34.7V4.5H4.3V36ZM6.5 31.5H32.5L24.4 20.3L17.9 29.3L13 22.5L6.5 31.5Z'],
    imageAdd: ['55 98 440 440', 'M92 104C96 103 106 104 111 104L147 104L269 104L399 104L437 104C446 104 455 103 464 104C468 105 475 108 479 111C484 117 489 124 490 131C491 136 491 146 491 151L491 181L491 288L491 322C491 327 490 335 491 340C482 335 466 329 456 329C457 316 457 302 457 288V215V169C457 161 457 153 456 145C456 142 452 138 449 138C445 138 440 138 435 138L406 138L316 138L174 138L127 138C119 138 111 138 103 138C101 138 100 138 98 140C96 141 95 143 95 145C94 148 94 150 94 153L94 166L94 208L94 348C94 357 95 367 94 376C97 374 104 367 108 365L142 335C148 330 155 324 162 319C165 317 172 315 175 314C184 312 195 314 203 318C208 321 217 329 222 333L240 349C243 352 247 355 250 357C256 353 262 347 267 342C281 329 295 316 310 303C316 298 323 290 329 286C334 283 342 281 347 280C355 279 365 281 372 285C377 288 383 294 388 298L411 319C413 321 415 323 418 325C419 327 420 327 422 329C396 333 372 347 356 365C334 389 326 416 327 448C321 447 314 448 308 448L270 448L154 448L114 448C105 448 96 448 87 447C83 446 76 442 73 440C66 434 61 425 60 416C60 411 60 403 60 399L60 366L60 264L60 176L60 150C60 145 60 139 61 134C63 117 75 105 92 104ZM497 503C463 534 410 532 377 499C345 465 345 412 378 379C410 346 464 344 498 376C532 408 534 461 504 496C502 498 499 500 497 503ZM430 430C423 430 415 430 408 430C404 430 399 430 395 430C394 431 392 431 391 432C386 437 386 442 391 446C391 447 391 447 392 447C396 448 403 448 408 448C415 447 423 447 430 447C431 456 430 465 430 473C430 477 430 481 431 485C432 489 436 491 440 491C442 490 445 489 446 487C448 483 447 454 448 448L472 447C476 447 481 448 485 447C488 447 491 442 491 438C491 435 487 431 484 431C481 430 477 430 474 430L458 430C455 430 450 430 447 430C448 424 447 416 448 410C448 405 448 396 447 392C444 389 443 388 439 387C434 388 431 391 430 396C430 401 430 407 430 413C430 418 430 425 430 430ZM194 172C213 170 230 184 232 202C234 221 221 238 202 241C183 243 166 230 164 211C162 192 175 175 194 172Z'],
    snow: ['0 0 58 58', 'M32.7 3.2C32.7 1.4 31 0 29 0C27 0 25.3 1.4 25.3 3.2V9.5L23.6 8C22.6 7 20.8 7 19.8 8C18.7 8.9 18.7 10.4 19.8 11.4L25.4 16.3V23.4L18.4 19.9L16.3 13.1C15.9 11.8 14.4 11.1 13 11.4C11.5 11.8 10.6 13.1 11 14.4L11.6 16.4L5.5 13.3C3.7 12.4 1.5 13 0.5 14.5C-0.5 16 0.1 18 1.8 18.9L8 22L5.6 22.6C4.2 22.9 3.3 24.2 3.7 25.5C4.1 26.8 5.6 27.6 7 27.2L14.7 25.4L21.7 29L14.7 32.6L7 30.8C5.6 30.4 4.1 31.2 3.7 32.5C3.3 33.8 4.2 35.1 5.6 35.4L8 36L1.8 39.1C0.1 40-0.5 42 0.5 43.5C1.5 45 3.7 45.6 5.5 44.7L11.6 41.6L11 43.6C10.6 44.9 11.5 46.2 12.9 46.6C14.4 46.9 15.9 46.2 16.3 44.9L18.4 38.1L25.3 34.6V41.7L19.7 46.6C18.7 47.6 18.7 49.1 19.7 50C20.8 51 22.6 51 23.6 50L25.3 48.5V54.8C25.3 56.6 27 58 29 58C31 58 32.7 56.6 32.7 54.8V48.5L34.4 50C35.4 51 37.2 51 38.2 50C39.3 49.1 39.3 47.6 38.2 46.6L32.6 41.7V34.6L39.6 38.1L41.7 44.9C42.1 46.2 43.6 46.9 45.1 46.6C46.5 46.2 47.4 44.9 47 43.6L46.4 41.6L52.5 44.7C54.3 45.6 56.5 45 57.5 43.5C58.5 42 57.9 40 56.2 39.1L50 36L52.4 35.4C53.8 35.1 54.7 33.8 54.3 32.5C53.9 31.2 52.4 30.4 51 30.8L43.3 32.6L36.3 29L43.3 25.4L51 27.2C52.4 27.6 53.9 26.8 54.3 25.5C54.7 24.2 53.8 22.9 52.4 22.6L50 22L56.2 18.9C57.9 18 58.5 16 57.5 14.5C56.5 13 54.3 12.4 52.5 13.3L46.4 16.4L47 14.4C47.4 13.1 46.5 11.8 45.1 11.4C43.6 11.1 42.1 11.8 41.7 13.1L39.6 19.9L32.6 23.4V16.3L38.2 11.4C39.3 10.4 39.3 8.9 38.2 8C37.2 7 35.4 7 34.4 8L32.7 9.5V3.2H32.7Z'],
    target: ['0 0 53 54', 'M26.3 53.3C22.6 53.3 19.2 52.6 16 51.2C12.8 49.8 10 47.9 7.7 45.5C5.3 43.1 3.4 40.3 2.1 37.1C0.7 33.8 0 30.4 0 26.7C0 23 0.7 19.5 2.1 16.3C3.4 13 5.3 10.2 7.7 7.8C10 5.4 12.8 3.5 16 2.1C19.2 0.7 22.6 0 26.3 0C28.8 0 31.2 0.3 33.6 1C35.9 1.7 38.1 2.7 40.1 4L36.2 7.9C34.7 7.1 33.2 6.4 31.5 6C29.8 5.6 28.1 5.3 26.3 5.3C20.4 5.3 15.4 7.4 11.4 11.5C7.3 15.7 5.3 20.7 5.3 26.7C5.3 32.6 7.3 37.7 11.4 41.8C15.4 45.9 20.4 48 26.3 48C32.1 48 37.1 45.9 41.1 41.8C45.2 37.7 47.3 32.6 47.3 26.7C47.3 25.6 47.2 24.5 47 23.4C46.8 22.3 46.6 21.3 46.3 20.3L50.4 16.1C51.1 17.8 51.6 19.5 52 21.2C52.3 23 52.5 24.8 52.5 26.7C52.5 30.4 51.8 33.8 50.4 37.1C49.1 40.3 47.2 43.1 44.8 45.5C42.5 47.9 39.7 49.8 36.5 51.2C33.3 52.6 29.9 53.3 26.3 53.3ZM26.3 42.7C21.9 42.7 18.2 41.1 15.1 38C12 34.9 10.5 31.1 10.5 26.7C10.5 22.2 12 18.4 15.1 15.3C18.2 12.2 21.9 10.7 26.3 10.7C27.3 10.7 28.4 10.8 29.4 11C30.4 11.2 31.4 11.5 32.3 11.9L28.1 16.1C27.8 16 27.5 16 27.2 16H26.3C23.4 16 20.9 17 18.8 19.1C16.8 21.2 15.8 23.7 15.8 26.7C15.8 29.6 16.8 32.1 18.8 34.2C20.9 36.3 23.4 37.3 26.3 37.3C27.6 37.3 29 37.1 30.3 36.5C31.6 35.9 32.7 35.2 33.7 34.1C34.2 33.6 34.6 33.1 35 32.6C35.4 32 35.7 31.4 36 30.8L41.9 24.7C42.2 27.2 41.9 29.6 41.1 31.9C40.4 34.2 39.1 36.3 37.4 38C36 39.4 34.3 40.6 32.4 41.4C30.5 42.2 28.4 42.7 26.3 42.7ZM26.3 33.1L18.4 25.1L22.1 21.3L26.3 25.6L48.8 2.7L52.5 6.4L26.3 33.1Z'],
    search: ['0 0 55 55', 'M44.7 22.3C44.7 27.3 43.1 31.8 40.4 35.5L54 49.1C55.3 50.5 55.3 52.7 54 54C52.6 55.3 50.5 55.3 49.1 54L35.5 40.4C31.8 43.1 27.3 44.7 22.3 44.7C10 44.7 0 34.7 0 22.3C0 10 10 0 22.3 0C34.7 0 44.7 10 44.7 22.3ZM22.3 37.8C30.9 37.8 37.8 30.9 37.8 22.3C37.8 13.8 30.9 6.9 22.3 6.9C13.8 6.9 6.9 13.8 6.9 22.3C6.9 30.9 13.8 37.8 22.3 37.8Z'],
    chevronLeft: ['0 0 17 23', 'M13.6 22.7L16 20.7L4.8 11.4L16 2L13.6 0L0 11.4L13.6 22.7Z'],
    chevronRight: ['0 0 17 23', 'M2.4 22.7L0 20.7L11.2 11.4L0 2L2.4 0L16 11.4L2.4 22.7Z'],
    chevronUp: ['0 -3 15 15', 'M14.8 7.6L13.5 8.9L7.4 2.7L1.3 8.9L0 7.6L7.4 0L14.8 7.6Z'],
    chevronDown: ['0 -3 15 15', 'M14.8 1.3L13.5 0L7.4 6.2L1.3 0L0 1.3L7.4 8.9L14.8 1.3Z'],
    userCircle: ['0 0 55 55', 'M10.4 40.9C12.7 39.1 15.3 37.7 18.1 36.7C21 35.7 24 35.2 27.1 35.2C30.2 35.2 33.2 35.7 36 36.7C38.9 37.7 41.4 39.1 43.7 40.9C45.3 39 46.5 36.9 47.4 34.6C48.3 32.3 48.8 29.7 48.8 27.1C48.8 21.1 46.6 16 42.4 11.7C38.2 7.5 33.1 5.4 27.1 5.4C21.1 5.4 16 7.5 11.7 11.7C7.5 16 5.4 21.1 5.4 27.1C5.4 29.7 5.9 32.3 6.7 34.6C7.6 36.9 8.8 39 10.4 40.9ZM20.3 27C18.5 25.2 17.6 23 17.6 20.3C17.6 17.6 18.5 15.4 20.3 13.6C22.2 11.7 24.4 10.8 27.1 10.8C29.7 10.8 32 11.7 33.8 13.6C35.6 15.4 36.6 17.6 36.6 20.3C36.6 23 35.6 25.2 33.8 27C32 28.9 29.7 29.8 27.1 29.8C24.4 29.8 22.2 28.9 20.3 27ZM27.1 54.2C23.3 54.2 19.8 53.5 16.5 52C13.2 50.6 10.4 48.7 7.9 46.2C5.5 43.8 3.6 40.9 2.1 37.6C0.7 34.4 0 30.8 0 27.1C0 23.3 0.7 19.8 2.1 16.5C3.6 13.2 5.5 10.4 7.9 7.9C10.4 5.5 13.2 3.6 16.5 2.1C19.8 0.7 23.3 0 27.1 0C30.8 0 34.4 0.7 37.6 2.1C40.9 3.6 43.8 5.5 46.2 7.9C48.7 10.4 50.6 13.2 52 16.5C53.5 19.8 54.2 23.3 54.2 27.1C54.2 30.8 53.5 34.4 52 37.6C50.6 40.9 48.7 43.8 46.2 46.2C43.8 48.7 40.9 50.6 37.6 52C34.4 53.5 30.8 54.2 27.1 54.2ZM33.9 47.7C36 47 37.9 46 39.7 44.7C37.9 43.4 36 42.4 33.9 41.7C31.7 41 29.5 40.6 27.1 40.6C24.7 40.6 22.4 41 20.3 41.7C18.2 42.4 16.3 43.4 14.5 44.7C16.3 46 18.2 47 20.3 47.7C22.4 48.4 24.7 48.8 27.1 48.8C29.5 48.8 31.7 48.4 33.9 47.7ZM30 23.2C30.8 22.5 31.1 21.5 31.1 20.3C31.1 19.1 30.8 18.2 30 17.4C29.2 16.6 28.3 16.3 27.1 16.3C25.9 16.3 24.9 16.6 24.2 17.4C23.4 18.2 23 19.1 23 20.3C23 21.5 23.4 22.5 24.2 23.2C24.9 24 25.9 24.4 27.1 24.4C28.3 24.4 29.2 24 30 23.2Z'],
    arrowRight: ['0 0 54 41', 'M52.6 22.5C53.9 21.2 53.9 19 52.6 17.7L35.9 1C34.6-0.3 32.4-0.3 31.1 1C29.8 2.3 29.8 4.4 31.1 5.7L42.2 16.8H3.4C1.5 16.8 0 18.3 0 20.1C0 22 1.5 23.5 3.4 23.5H42.2L31.1 34.5C29.8 35.8 29.8 37.9 31.1 39.2C32.4 40.5 34.6 40.5 35.9 39.2L52.6 22.5V22.5Z'],
    arrowLeft: ['0 0 56 42', 'M1 18.3C-0.3 19.6-0.3 21.8 1 23.2L18.3 40.4C19.6 41.8 21.8 41.8 23.1 40.4C24.5 39.1 24.5 36.9 23.1 35.5L11.8 24.2H51.7C53.7 24.2 55.2 22.6 55.2 20.7C55.2 18.8 53.7 17.3 51.7 17.3H11.8L23.1 5.9C24.5 4.5 24.5 2.4 23.1 1C21.8-0.3 19.6-0.3 18.3 1L1 18.3V18.3Z'],
    history: ['14 20 232 226', 'M133 53C177 53 213 89 213 133C213 177 177 213 133 213C106 213 82 199 67 179C63 173 55 171 49 175C43 180 41 188 46 194C65 221 97 239 133 239C192 239 239 192 239 133C239 74 192 27 133 27C97 27 66 44 47 71V60C47 52 41 47 33 47C26 47 20 52 20 60V106C20 114 26 120 33 120H80C87 120 93 114 93 106C93 99 87 93 80 93H64C78 69 103 53 133 53ZM143 90C143 84 139 80 133 80C127 80 123 84 123 90V133C123 136 124 138 126 140L156 170C160 174 166 174 170 170C174 166 174 160 170 156L143 129V90H143Z'],
    wallet: ['0 0 62 50', 'M7.8 0C3.5 0 0 3.4 0 7.7V42.3C0 46.6 3.5 50 7.8 50H54.3C58.5 50 62 46.6 62 42.3V19.2C62 15 58.5 11.5 54.3 11.5H8.7C7.1 11.5 5.8 10.3 5.8 8.7C5.8 7.1 7.1 5.8 8.7 5.8H55.2C56.8 5.8 58.1 4.5 58.1 2.9C58.1 1.3 56.8 0 55.2 0H7.8ZM50.4 26.9C52.5 26.9 54.3 28.6 54.3 30.8C54.3 32.9 52.5 34.6 50.4 34.6C48.2 34.6 46.5 32.9 46.5 30.8C46.5 28.6 48.2 26.9 50.4 26.9Z'],
    mountain: ['0 0 68 55', 'M30.2 0C31.9 0 33.5 0.9 34.4 2.4L59.9 48.2C60.7 49.7 60.6 51.4 59.8 52.8C58.9 54.2 57.4 55 55.7 55H4.7C3 55 1.5 54.2 0.7 52.8C-0.2 51.4-0.2 49.7 0.6 48.2L26.1 2.4L26.4 1.9C27.3 0.7 28.7 0 30.2 0ZM20 28.6L23.2 31.7C23.9 32.4 25.1 32.4 25.9 31.7L31 26.7C31.7 26.1 32.7 25.7 33.7 25.7H38.7L30.2 10.4L20 28.6H20ZM58.6 18.3C53.3 18.3 49.1 14.2 49.1 9.2C49.1 4.1 53.3 0 58.6 0C63.8 0 68 4.1 68 9.2C68 14.2 63.8 18.3 58.6 18.3Z'],
    pencil: ['0 0 48 48', 'M44.6 33.2C44.2 31.8 43.5 30.5 42.5 29.5L25.5 12.6L22.3 9.4C20.7 10.9 17.5 14.2 12.6 19.1L9.4 22.3L12.6 25.5L29.5 42.5C30.5 43.5 31.8 44.2 33.2 44.6L45.2 47.9C45.9 48.1 46.8 47.9 47.3 47.3C47.9 46.8 48.1 45.9 47.9 45.1L44.6 33.2ZM39.4 32.8C39.8 33.3 40.1 33.8 40.2 34.4L42.5 42.5L34.4 40.3C33.8 40.1 33.2 39.8 32.8 39.4L39.4 32.8H39.4ZM6.2 19.1C7.7 17.6 11 14.3 15.9 9.4L19.1 6.2C16.6 3.7 15.2 2.3 14.9 2C13.7 0.7 11.9 0 10.1 0C8.3 0 6.6 0.7 5.3 2L2 5.3C0.7 6.6 0 8.3 0 10.1C0 11.9 0.7 13.6 2 14.9C2.3 15.2 3.7 16.6 6.2 19.1H6.2Z'],
    key: ['0 0 51 52', 'M33.5 35.8C43.2 35.8 51 27.7 51 17.9C51 8 43.2 0 33.5 0C23.8 0 15.9 8 15.9 17.9C15.9 19.8 16.2 21.6 16.8 23.3L0.7 39.7C0.2 40.2 0 40.8 0 41.4V49.6C0 50.9 1.1 52 2.4 52H10.4C11.7 52 12.8 50.9 12.8 49.6V45.5H16.7C18.1 45.5 19.1 44.4 19.1 43.1V39H23.1C23.7 39 24.4 38.7 24.8 38.3L28.1 34.9C29.8 35.5 31.6 35.8 33.5 35.8ZM37.5 9.8C39.7 9.8 41.4 11.6 41.4 13.8C41.4 16.1 39.7 17.9 37.5 17.9C35.3 17.9 33.5 16.1 33.5 13.8C33.5 11.6 35.3 9.8 37.5 9.8Z'],
    bell: ['0 0 46 52', 'M23 0C21.2 0 19.7 1.5 19.7 3.3V3.6C12.2 5.1 6.6 11.6 6.6 19.5V21.7C6.6 26.6 4.9 31.3 1.8 35.2L0.8 36.4C0.3 37 0 37.8 0 38.6C0 40.6 1.6 42.3 3.6 42.3H42.4C44.4 42.3 46 40.6 46 38.6C46 37.8 45.7 37 45.2 36.4L44.2 35.2C41.1 31.3 39.4 26.6 39.4 21.7V19.5C39.4 11.6 33.8 5.1 26.3 3.6V3.3C26.3 1.5 24.8 0 23 0ZM16.6 47.1C17.4 49.9 19.9 52 23 52C26.1 52 28.6 49.9 29.4 47.1H16.6Z'],
    logout: ['0 0 57 52', 'M56.2 24C57.3 25.1 57.3 26.9 56.2 28L40.2 44.7C39.4 45.5 38.3 45.7 37.3 45.3C36.3 44.9 35.6 43.8 35.6 42.7V33.4H23.2C20.2 33.4 17.8 30.9 17.8 27.9V24.1C17.8 21.1 20.2 18.6 23.2 18.6H35.6V9.3C35.6 8.2 36.3 7.1 37.3 6.7C38.3 6.3 39.4 6.5 40.2 7.3L56.2 24ZM17.8 44.6C19.8 44.6 21.4 46.2 21.4 48.3C21.4 50.3 19.8 52 17.8 52H10.7C4.8 52 0 47 0 40.9V11.1C0 5 4.8 0 10.7 0H17.8C19.8 0 21.4 1.7 21.4 3.7C21.4 5.8 19.8 7.4 17.8 7.4H10.7C8.7 7.4 7.1 9.1 7.1 11.1V40.9C7.1 42.9 8.7 44.6 10.7 44.6H17.8Z'],
    eyeOff: ['0 0 55 55', 'M3.9 0.7C3-0.2 1.6-0.2 0.7 0.7C-0.2 1.6-0.2 3 0.7 3.9L51.1 54.3C52 55.2 53.4 55.2 54.3 54.3C55.2 53.4 55.2 52 54.3 51.1L45.1 41.9C45.4 41.7 45.6 41.4 45.9 41.2C50.4 37 53.3 32.1 54.8 28.7C55.1 27.9 55.1 27.1 54.8 26.3C53.3 22.9 50.4 18 45.9 13.8C41.4 9.6 35.2 6.1 27.5 6.1C22.1 6.1 17.4 7.9 13.5 10.3L3.9 0.7ZM19.5 16.3C21.8 14.7 24.5 13.7 27.5 13.7C35.1 13.7 41.3 19.9 41.3 27.5C41.3 30.5 40.3 33.2 38.7 35.5L35.4 32.1C36.6 30.1 37 27.6 36.4 25.1C35 20.2 30 17.3 25.1 18.6C24.3 18.9 23.5 19.2 22.8 19.6L19.5 16.3L19.5 16.3ZM31.1 40.8C29.9 41.1 28.7 41.2 27.5 41.2C19.9 41.2 13.7 35.1 13.7 27.5C13.7 26.3 13.9 25.1 14.2 23.9L6.6 16.3C3.5 19.9 1.4 23.6 0.2 26.3C-0.1 27.1-0.1 27.9 0.2 28.7C1.7 32.1 4.6 37 9.1 41.2C13.6 45.4 19.8 48.9 27.5 48.9C31.1 48.9 34.3 48.1 37.2 46.9L31.1 40.8L31.1 40.8Z'],
    camera: ['0 0 50 44', 'M14.6 3.2L13.5 6.3H6.3C2.8 6.3 0 9.1 0 12.6V37.7C0 41.2 2.8 44 6.3 44H43.8C47.2 44 50 41.2 50 37.7V12.6C50 9.1 47.2 6.3 43.8 6.3H36.5L35.4 3.2C34.8 1.3 33 0 31 0H19C17 0 15.2 1.3 14.6 3.2ZM25 15.7C30.2 15.7 34.4 19.9 34.4 25.1C34.4 30.3 30.2 34.6 25 34.6C19.8 34.6 15.6 30.3 15.6 25.1C15.6 19.9 19.8 15.7 25 15.7Z'],
    eye: ['0 0 54 42', 'M27 0C19.4 0 13.4 3.5 8.9 7.6C4.6 11.6 1.6 16.5 0.2 19.8C-0.1 20.6-0.1 21.4 0.2 22.2C1.6 25.5 4.6 30.4 8.9 34.4C13.4 38.5 19.4 42 27 42C34.6 42 40.6 38.5 45.1 34.4C49.4 30.4 52.4 25.5 53.8 22.2C54.1 21.4 54.1 20.6 53.8 19.8C52.4 16.5 49.4 11.6 45.1 7.6C40.6 3.5 34.6 0 27 0ZM13.5 21C13.5 13.5 19.5 7.5 27 7.5C34.5 7.5 40.5 13.5 40.5 21C40.5 28.5 34.5 34.5 27 34.5C19.5 34.5 13.5 28.5 13.5 21ZM27 15C27 18.3 24.3 21 21 21C19.9 21 18.9 20.7 18 20.2C17.9 21.2 18 22.3 18.3 23.3C19.6 28.1 24.5 31 29.3 29.7C34.1 28.4 37 23.5 35.7 18.7C34.5 14.4 30.5 11.7 26.2 12C26.7 12.9 27 13.9 27 15Z'],
    gear: ['0 0 41 44', 'M15.6 2.1C15.8 0.9 16.9 0 18.1 0H22.9C24.1 0 25.2 0.9 25.4 2.1L26.6 7.7C27.7 8.2 28.8 8.8 29.7 9.6L35.2 7.7C36.4 7.4 37.6 7.8 38.2 8.9L40.7 13.1C41.3 14.2 41 15.5 40.1 16.3L35.8 20.2C35.9 20.8 35.9 21.4 35.9 22C35.9 22.6 35.9 23.2 35.8 23.8L40.1 27.7C41.1 28.5 41.3 29.8 40.7 30.9L38.3 35.1C37.6 36.2 36.4 36.6 35.2 36.3L29.8 34.4C28.8 35.2 27.7 35.8 26.6 36.3L25.4 41.9C25.2 43.1 24.1 44 22.9 44H18.1C16.9 44 15.8 43.1 15.6 41.9L14.4 36.3C13.3 35.8 12.2 35.2 11.3 34.4L5.8 36.3C4.6 36.6 3.4 36.2 2.8 35.1L0.3 30.9C-0.3 29.8 0 28.5 0.9 27.7L5.2 23.8C5.1 23.2 5.1 22.6 5.1 22C5.1 21.4 5.1 20.8 5.2 20.2L0.9 16.3C0 15.5-0.3 14.2 0.3 13.1L2.8 8.9C3.4 7.8 4.6 7.4 5.8 7.7L11.2 9.6C12.2 8.8 13.3 8.2 14.4 7.7L15.6 2.1ZM20.5 28.5C24.1 28.5 26.9 25.6 26.9 22C26.9 18.4 24 15.5 20.4 15.5C16.9 15.5 14 18.4 14 22C14.1 25.6 16.9 28.5 20.5 28.5Z'],
    // Wi-Fi: สไตล์ทึบแบบ Figma (wifi-solid) วาดใหม่ให้ขนาดเท่าไอคอนอื่น
    wifi: ['0 0 24 24', '', '<path d="M2 9.4a14.2 14.2 0 0 1 20 0M5.4 12.9a9.4 9.4 0 0 1 13.2 0M8.8 16.3a4.6 4.6 0 0 1 6.4 0" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/><circle cx="12" cy="20" r="2.2"/>'],
    user: 'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5 0-9 2.5-9 6v2h18v-2c0-3.5-4-6-9-6z',
    plusCircle: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 5v4h4v2h-4v4h-2v-4H7v-2h4V7h2z',
    x: 'M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4 17.6 5 12 10.6 6.4 5z',
    car: 'M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11a2 2 0 0 1 2 2v5h-2v2h-2v-2H7v2H5v-2H3v-5a2 2 0 0 1 2-2zm2.1 0h9.8l-1-3H8.1l-1 3zM6.5 13a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z',
    sun: 'M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm-1-6h2v3h-2V1zm0 19h2v3h-2v-3zM1 11h3v2H1v-2zm19 0h3v2h-3v-2zM4.2 5.6l1.4-1.4 2.1 2.1-1.4 1.4-2.1-2.1zm12.1 12.1 1.4-1.4 2.1 2.1-1.4 1.4-2.1-2.1zM4.2 18.4l2.1-2.1 1.4 1.4-2.1 2.1-1.4-1.4zM16.3 6.3l2.1-2.1 1.4 1.4-2.1 2.1-1.4-1.4z',
    clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 5v5.2l3.6 2.1-1 1.7L11 13.3V7h2z',
    home: 'M12 3 2 11.5h3V21h5v-6h4v6h5v-9.5h3L12 3z',
    menu: 'M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z',
    qr: 'M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm8-2h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h4v2h-4v-2zm-4 4h2v4h-2v-4zm4 0h4v4h-2v-2h-2v-2zm0 4h2v0z',
    scan: 'M3 3h6v2H5v4H3V3zm12 0h6v6h-2V5h-4V3zM3 15h2v4h4v2H3v-6zm16 0h2v6h-6v-2h4v-4zM7 11h10v2H7v-2z',
    star: 'M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9L12 2.5z',
    leaf: 'M20 3s-9 0-13 4c-3.2 3.2-2.7 7.4-1.4 9.5L3 19l1.4 1.4 2.6-2.6c2.1 1.3 6.3 1.8 9.5-1.4C20.5 12.4 20 3 20 3z',
    mail: 'M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 2.2V17h16V7.2l-8 5.3-8-5.3zM5.6 7l6.4 4.2L18.4 7H5.6z',
    lock: 'M12 2a5 5 0 0 0-5 5v3H5v12h14V10h-2V7a5 5 0 0 0-5-5zm-3 8V7a3 3 0 1 1 6 0v3H9zm3 4a2 2 0 0 1 1 3.7V20h-2v-2.3A2 2 0 0 1 12 14z',
    trash: 'M9 3h6l1 2h4v2H4V5h4l1-2zM5 9h14l-1 12H6L5 9z',
    share: 'M18 16a3 3 0 0 0-2.4 1.2l-7-3.5a3 3 0 0 0 0-1.4l7-3.5A3 3 0 1 0 15 7c0 .2 0 .5.1.7l-7 3.5a3 3 0 1 0 0 3.6l7 3.5A3 3 0 1 0 18 16z',
    check: 'M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z',
  };

  function icon(name, cls = '') {
    const v = P[name] || P.star;
    if (typeof v === 'string') return `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${v}"/></svg>`;
    const inner = v[2] || `<path d="${v[1]}"/>`;
    return `<svg class="icon ${cls}" viewBox="${v[0]}" aria-hidden="true">${inner}</svg>`;
  }

  // ลูกเต๋า (ใช้ในปุ่มสุ่มและ animation)
  function diceSVG(size = 120) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true">
      <rect x="44" y="38" width="64" height="64" rx="14" fill="#7F4D2F" transform="rotate(14 76 70)"/>
      <rect x="12" y="10" width="68" height="68" rx="16" fill="#7F4D2F" stroke="#fff" stroke-width="6" transform="rotate(-12 46 44)"/>
      <g fill="#fff" transform="rotate(-12 46 44)">
        <circle cx="30" cy="28" r="7"/><circle cx="62" cy="28" r="7"/><circle cx="46" cy="44" r="7"/><circle cx="30" cy="60" r="7"/><circle cx="62" cy="60" r="7"/>
      </g></svg>`;
  }

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Logo ---------- */
  /* รูปภาพ: ลองไฟล์ในโฟลเดอร์ assets/ ก่อน → ถ้าไม่มีใช้รูปบน Supabase Storage → ถ้าไม่มีอีกใช้ fallback */
  function assetImg(path, { cls = '', alt = '', ph = '', emoji = '', text = '', lazy = true } = {}) {
    const base = (window.KRD_CONFIG || {}).IMG_BASE;
    return `<img class="${cls}" src="assets/${path}" alt="${esc(alt)}" ${lazy ? 'loading="lazy"' : ''}
      ${base ? `data-alt="${base}/${path}"` : ''} data-ph="${ph}" data-emoji="${esc(emoji)}" data-text="${esc(text)}" onerror="KRD.imgFail(this)">`;
  }
  function logoHTML(cls = '') {
    return `<span class="logo ${cls}">${assetImg('logo.png', { alt: 'กินรัยดี', text: 'กิน-รัย-ดี', lazy: false })}</span>`;
  }

  /* ---------- Header / Footer ---------- */
  const NAV = [
    { href: 'index.html', label: 'สุ่มเลย !', key: 'home', icon: 'home', mobileLabel: 'หน้าหลัก' },
    { href: 'member.html', label: 'สมาชิก', key: 'member', icon: 'users' },
    { href: 'history.html', label: 'ประวัติ', key: 'history', icon: 'history' },
  ];

  function renderHeader(active, opts = {}) {
    const me = opts.me;
    const avatar = me && me.avatar_url ? `<img src="${esc(me.avatar_url)}" alt="">` : icon('userCircle');
    // เมนู ☰ บนมือถือ (การ์ดตาม Figma "settings"): ปุ่ม 2×2 + สแกน QR เต็มแถว
    // บนหน้า result: "สุ่มเลย !" = สุ่มใหม่ทันที
    const PILLS = [
      { href: 'index.html', key: 'home', label: 'สุ่มเลย !', icon: 'home', cls: 'p-yellow' },
      { href: 'member.html', key: 'member', label: 'สมาชิก', icon: 'users', cls: 'p-pink' },
      { href: 'history.html', key: 'history', label: 'ประวัติ', icon: 'history', cls: 'p-blue' },
      { href: 'profile.html', key: 'profile', label: 'โปรไฟล์', icon: 'user', cls: 'p-green' },
    ];
    const pills = PILLS.map((n) => {
      const reroll = n.key === 'home' && opts.onMobileReroll;
      return `<a href="${reroll ? '#' : n.href}" class="mm-pill ${n.cls} ${active === n.key ? 'active' : ''}" ${reroll ? 'data-reroll' : ''}>${icon(n.icon)}<span>${n.label}</span></a>`;
    }).join('');

    const html = `
      ${KRD.api && KRD.api.mode === 'demo' ? '<div class="demo-banner">โหมดเดโม — ข้อมูลเก็บในเบราว์เซอร์นี้เท่านั้น (ใส่ค่า Supabase ใน js/config.js เพื่อใช้งานจริง)</div>' : ''}
      <header class="site-header">
        <div class="container">
          <a href="index.html" aria-label="หน้าหลัก">${logoHTML()}</a>
          <nav class="main-nav">
            ${NAV.map((n) => `<a href="${n.href}" class="${active === n.key ? 'active' : ''}">${n.label}</a>`).join('')}
            <a href="profile.html" class="nav-avatar" aria-label="โปรไฟล์">${avatar}</a>
          </nav>
          <button class="menu-btn" aria-label="เมนู" aria-expanded="false">${icon('menu')}</button>
        </div>
      </header>
      <nav class="mobile-menu" aria-label="เมนู">
        <div class="mm-head"><b>เมนู</b><button class="mm-close" aria-label="ปิดเมนู">${icon('chevronUp')}</button></div>
        <div class="mm-grid">${pills}</div>
        <button class="mm-scan" type="button">${icon('scan')}<span>สแกน QR</span></button>
      </nav>`;
    const holder = document.getElementById('site-header');
    holder.innerHTML = html;
    const btn = holder.querySelector('.menu-btn');
    const menu = holder.querySelector('.mobile-menu');
    const setOpen = (open) => { menu.classList.toggle('open', open); btn.setAttribute('aria-expanded', open); };
    btn.addEventListener('click', (e) => { e.stopPropagation(); setOpen(!menu.classList.contains('open')); });
    holder.querySelector('.mm-close').addEventListener('click', () => setOpen(false));
    document.addEventListener('click', (e) => { if (!menu.contains(e.target) && e.target !== btn) setOpen(false); });
    const rr = holder.querySelector('[data-reroll]');
    if (rr) rr.addEventListener('click', (e) => { e.preventDefault(); setOpen(false); opts.onMobileReroll(); });
    // "สแกน QR" ได้จากทุกหน้า: QR หัวทีม = เข้าร่วมมื้อ / QR โปรไฟล์ = เพิ่มเพื่อน
    holder.querySelector('.mm-scan').addEventListener('click', () => {
      setOpen(false);
      if (!me) { location.href = 'login.html?next=' + encodeURIComponent(location.pathname.split('/').pop() + location.search); return; }
      // เปิด popup "มาจอยกัน !" ตัวเดียวกับปุ่ม + (หน้าสุ่มเลยส่ง onMenuScan มาให้ = โหมดเข้าร่วมมื้อ)
      if (opts.onMenuScan) opts.onMenuScan();
      else KRD.people.joinPopup(me, { mode: 'friend' });
    });
  }

  // โลโก้โซเชียล (สัญลักษณ์ทางการ) — ตอนนี้เป็นของตกแต่ง ยังไม่ลิงก์ไปไหน
  const SOCIAL_ICONS = `
    <span class="soc soc-tiktok" title="TikTok"><svg viewBox="0 0 24 24"><path fill="#25F4EE" d="M11.4 1h3.5c.2 2.2 1.6 4 3.9 4.3v3.4c-1.4 0-2.7-.4-3.9-1.1v6.6c0 3.4-2.8 6.1-6.2 6.1S2.5 17.6 2.5 14.2s2.8-6.1 6.2-6.1c.3 0 .6 0 .9.1v3.5c-.3-.1-.6-.2-.9-.2-1.5 0-2.7 1.2-2.7 2.7s1.2 2.7 2.7 2.7 2.7-1.2 2.7-2.7V1z" transform="translate(-.7 .5)"/><path fill="#FE2C55" d="M11.4 1h3.5c.2 2.2 1.6 4 3.9 4.3v3.4c-1.4 0-2.7-.4-3.9-1.1v6.6c0 3.4-2.8 6.1-6.2 6.1S2.5 17.6 2.5 14.2s2.8-6.1 6.2-6.1c.3 0 .6 0 .9.1v3.5c-.3-.1-.6-.2-.9-.2-1.5 0-2.7 1.2-2.7 2.7s1.2 2.7 2.7 2.7 2.7-1.2 2.7-2.7V1z" transform="translate(.7 -.3)"/><path fill="#111" d="M11.4 1h3.5c.2 2.2 1.6 4 3.9 4.3v3.4c-1.4 0-2.7-.4-3.9-1.1v6.6c0 3.4-2.8 6.1-6.2 6.1S2.5 17.6 2.5 14.2s2.8-6.1 6.2-6.1c.3 0 .6 0 .9.1v3.5c-.3-.1-.6-.2-.9-.2-1.5 0-2.7 1.2-2.7 2.7s1.2 2.7 2.7 2.7 2.7-1.2 2.7-2.7V1z"/></svg></span>
    <span class="soc soc-fb" title="Facebook"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#1877F2"/><path fill="#fff" d="M15.1 15.5l.5-3.5h-3.3V9.8c0-1 .5-1.9 2-1.9h1.5v-3s-1.4-.2-2.7-.2c-2.8 0-4.5 1.7-4.5 4.7V12H5.6v3.5h3v8.4a12 12 0 0 0 3.7 0v-8.4h2.8z"/></svg></span>
    <span class="soc soc-ig" title="Instagram"><svg viewBox="0 0 24 24"><defs><radialGradient id="igg" cx="30%" cy="107%" r="150%"><stop offset="0" stop-color="#fdf497"/><stop offset=".05" stop-color="#fdf497"/><stop offset=".45" stop-color="#fd5949"/><stop offset=".6" stop-color="#d6249f"/><stop offset=".9" stop-color="#285AEB"/></radialGradient></defs><rect x="1" y="1" width="22" height="22" rx="6.5" fill="url(#igg)"/><rect x="5.5" y="5.5" width="13" height="13" rx="4" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="12" cy="12" r="3.2" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="16.4" cy="7.6" r="1" fill="#fff"/></svg></span>`;

  function renderFooter() {
    const el = document.getElementById('site-footer');
    if (!el) return;
    el.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">${logoHTML('footer-logo')}</div>
            <nav class="footer-links">
              <a href="index.html">หน้าหลัก</a><a href="history.html">ประวัติ</a>
              <a href="profile.html">โปรไฟล์</a><a href="member.html">สมาชิก</a>
              <a href="team.html">ผู้จัดทำ</a>
            </nav>
            <div class="footer-contact">
              <h4>ช่องทางการติดต่อ</h4>
              <p>อีเมล : kinraidixxx@gmail.com</p>
              <p>เบอร์โทรศัพท์ : 012-345-6789</p>
              <div class="socials" aria-hidden="true">${SOCIAL_ICONS}</div>
            </div>
          </div>
          <p class="copyright">© KINRAIDI Project Silpakorn University. All Rights Reserved 2026</p>
          <p class="disclaimer">เว็บไซต์นี้จัดทำขึ้นโดยนักศึกษาชั้นปีที่ 2 คณะเทคโนโลยีสารสนเทศและการสื่อสาร สาขาเทคโนโลยีสื่อสร้างสรรค์ ปีการศึกษา 2569 กลุ่มกินรัยดี · ใช้เพื่อการศึกษาในรายวิชาเทคโนโลยีการผลิตสื่อโต้ตอบเท่านั้น</p>
        </div>
      </footer>`;
  }

  /* ---------- Toast ---------- */
  function toast(msg, type = '') {
    let wrap = document.querySelector('.toast-wrap');
    if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toast-wrap'; document.body.appendChild(wrap); }
    const t = document.createElement('div');
    t.className = 'toast ' + type; t.textContent = msg;
    wrap.appendChild(t);
    setTimeout(() => t.remove(), 2800);
  }

  /* ---------- Modal ----------
     ทุก popup ใช้ธีมเดียวกันทั้งเว็บ: กรอบน้ำตาล + แถบหัวน้ำตาล + หัวข้อตัวขาวตรงกลาง (มีไอคอน) + ปุ่ม ✕
     openModal({ title, iconName, body (html), wide, onMount(el, close), onClose }) — theme เก่าไม่มีผลแล้ว */
  function openModal({ title = '', iconName = '', body = '', theme = 'yellow', wide = false, onMount, onClose, noHead = false }) {
    const back = document.createElement('div');
    back.className = 'modal-backdrop';
    back.innerHTML = `
      <div class="modal ${wide ? 'wide' : ''} ${noHead ? 'no-head' : ''}" role="dialog" aria-modal="true">
        ${noHead ? `<button class="modal-close" aria-label="ปิด">${icon('x')}</button>`
          : `<div class="modal-head"><h3>${iconName ? icon(iconName) : ''}<span>${esc(title)}</span></h3><button class="modal-close" aria-label="ปิด">${icon('x')}</button></div>`}
        <div class="modal-body">${body}</div>
      </div>`;
    document.body.appendChild(back);
    document.body.style.overflow = 'hidden';
    const close = () => {
      back.remove();
      if (!document.querySelector('.modal-backdrop')) document.body.style.overflow = '';
      onClose && onClose();
      document.removeEventListener('keydown', onKey);
    };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    back.querySelector('.modal-close').addEventListener('click', close);
    back.addEventListener('mousedown', (e) => { if (e.target === back) close(); });
    onMount && onMount(back.querySelector('.modal'), close);
    return close;
  }

  function confirmModal({ title, message, okText = 'ตกลง', cancelText = 'ยกเลิก', danger = false, iconName = 'gear' }) {
    return new Promise((resolve) => {
      let done = false;
      openModal({
        title, iconName,
        body: `<p style="font-size:18px;text-align:center;margin:8px 0 20px">${esc(message)}</p>
               <div class="modal-actions" style="justify-content:center">
                 <button class="btn" data-no>${esc(cancelText)}</button>
                 <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-yes>${esc(okText)}</button>
               </div>`,
        onMount(el, close) {
          el.querySelector('[data-no]').onclick = () => { done = true; resolve(false); close(); };
          el.querySelector('[data-yes]').onclick = () => { done = true; resolve(true); close(); };
        },
        onClose() { if (!done) resolve(false); },
      });
    });
  }

  /* ---------- Avatar ---------- */
  function avatarHTML(p, cls = '') {
    if (!p) return `<span class="avatar empty ${cls}">${icon('userCircle')}</span>`;
    if (p.avatar_url) return `<span class="avatar ${cls}"><img src="${esc(p.avatar_url)}" alt="${esc(p.display_name)}"></span>`;
    const ch = (p.display_name || p.email || '?').trim().charAt(0).toUpperCase();
    return `<span class="avatar ${cls}" style="background:${colorFor(p.id)}"><span class="initial">${esc(ch)}</span></span>`;
  }
  function colorFor(id = '') {
    const c = ['#FDE8B0', '#D7E8B8', '#F3D1DF', '#D8EAF6', '#F6DD78', '#E8D5C4'];
    let h = 0; for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return c[h % c.length];
  }
  function mbtiBadge(m) {
    if (!m) return '<span class="mbti">?</span>';
    m = m.toUpperCase();
    const g = m[1] === 'N' ? (m[2] === 'F' ? 'NF' : 'NT') : (m[3] === 'P' ? 'SP' : 'SJ');
    return `<span class="mbti ${g}">${esc(m)}</span>`;
  }

  /* ---------- รูปร้าน ---------- */
  function rImg(r, n = 1, cls = 'cover') {
    const idx = (r.id.length + n) % 4;
    return assetImg(`img/${r.id}-${n}.jpg`, { cls, alt: r.name, ph: idx, emoji: r.emoji || '🍽️' });
  }
  // โหลดรูปไม่ได้ → ลองที่สำรอง (Supabase) → ถ้ายังไม่ได้ แสดงพื้นสี + อีโมจิ / ข้อความแทน
  function imgFail(img) {
    if (img.dataset.alt) { const a = img.dataset.alt; img.removeAttribute('data-alt'); img.src = a; return; }
    const d = document.createElement(img.dataset.text ? 'span' : 'div');
    if (img.dataset.text) { d.className = 'logo-fallback'; d.textContent = img.dataset.text; }
    else if (img.dataset.emoji) { d.className = 'ph ph-' + img.dataset.ph; d.textContent = img.dataset.emoji; }
    else { img.remove(); return; }
    img.replaceWith(d);
  }

  function featIcons(r, max = 4) {
    const map = { aircon: ['snow', 'f-aircon', 'ห้องแอร์'], quiet: ['face', 'f-quiet', 'เงียบสงบ'], pet: ['paw', 'f-pet', 'สัตว์เลี้ยงเข้าได้'], wifi: ['wifi', 'f-wifi', 'Wi-Fi'], parking: ['car', 'f-parking', 'มีที่จอดรถ'], outdoor: ['sun', 'f-outdoor', 'กลางแจ้ง'], halal: ['leaf', 'f-halal', 'ฮาลาล'] };
    return `<span class="feat-icons">${r.feat.slice(0, max).map((f) => map[f] ? `<span title="${map[f][2]}">${icon(map[f][0], map[f][1])}</span>` : '').join('')}</span>`;
  }

  function restaurantCard(r, { fav = false } = {}) {
    return `
      <article class="r-card">
        <div class="thumb">
          <a href="restaurant.html?id=${r.id}">${rImg(r, 1)}</a>
          <button class="fav-btn ${fav ? 'on' : ''}" data-fav="${r.id}" aria-label="ร้านโปรด">${icon(fav ? 'heart' : 'heartOutline')}</button>
        </div>
        <div class="meta"><h3>${esc(r.name)}</h3>${featIcons(r, 3)}</div>
        <p>${esc(r.short)}</p>
        <a class="btn btn-yellow btn-sm" href="restaurant.html?id=${r.id}">อ่านต่อ</a>
      </article>`;
  }

  // ผูกปุ่มหัวใจทั้งหมดในหน้า
  function bindFavButtons(root = document) {
    root.querySelectorAll('[data-fav]').forEach((b) => {
      if (b.dataset.bound) return; b.dataset.bound = 1;
      b.addEventListener('click', async (e) => {
        e.preventDefault(); e.stopPropagation();
        try {
          const on = await KRD.api.toggleFavorite(b.dataset.fav);
          document.querySelectorAll(`[data-fav="${b.dataset.fav}"]`).forEach((x) => {
            x.classList.toggle('on', on); x.innerHTML = icon(on ? 'heart' : 'heartOutline');
          });
          toast(on ? 'เพิ่มในร้านโปรดแล้ว' : 'นำออกจากร้านโปรดแล้ว');
        } catch (err) { toast(err.message, 'error'); }
      });
    });
  }

  /* ---------- Dice overlay: ลูกเต๋าวงรุ้งเด้งขึ้นกลางจอแล้วเขย่า ~1.2 วิ บนพื้นเบลอจางๆ ---------- */
  function diceRoll(ms = 1200) {
    return new Promise((res) => {
      const o = document.createElement('div');
      o.className = 'dice-overlay';
      o.innerHTML = `<div class="dice-pop"><div class="dice-ring"><span class="dice-svg">${diceSVG(120)}</span></div></div><p>กำลังสุ่มร้านที่ใช่…</p>`;
      document.body.appendChild(o);
      setTimeout(() => { o.classList.add('out'); setTimeout(() => { o.remove(); res(); }, 180); }, ms);
    });
  }

  /* ---------- ปุ่มลูกเต๋าลอย (หน้าสุ่มเลย + หน้าผลลัพธ์) ----------
     - โผล่เมื่อปุ่มลูกเต๋าใหญ่ (watch) เลื่อนพ้นจอ
     - ลากไปวางตรงไหนก็ได้ (จำตำแหน่งใน localStorage krd_fab_pos) / กดเฉยๆ = onClick
     - สั่นสั้นๆ ทุก ~3 วินาที เรียกความสนใจ */
  function fabDice({ onClick, watch } = {}) {
    const KEY = 'krd_fab_pos';
    const fab = document.createElement('button');
    fab.className = 'fab-dice';
    fab.setAttribute('aria-label', 'สุ่มเลย (ลากเพื่อย้ายปุ่มได้)');
    fab.innerHTML = `<span class="fab-inner">${diceSVG(64)}<span>สุ่มเลย !</span></span>`;
    document.body.appendChild(fab);

    const size = () => fab.getBoundingClientRect();
    const clamp = (x, y) => {
      const r = size(), m = 8;
      return [Math.min(Math.max(m, x), innerWidth - r.width - m), Math.min(Math.max(m, y), innerHeight - r.height - m)];
    };
    const place = (x, y) => { [x, y] = clamp(x, y); fab.style.left = x + 'px'; fab.style.top = y + 'px'; };
    const restore = () => {
      let pos = null;
      try { pos = JSON.parse(localStorage.getItem(KEY)); } catch {}
      const r = size();
      if (pos) place(pos.x * innerWidth, pos.y * innerHeight);
      else place(innerWidth - r.width - 20, innerHeight - r.height - 24);
    };
    restore();
    addEventListener('resize', restore);

    let start = null, moved = false;
    fab.addEventListener('pointerdown', (e) => {
      const r = size();
      start = { px: e.clientX, py: e.clientY, x: r.left, y: r.top };
      moved = false;
      fab.setPointerCapture(e.pointerId);
    });
    fab.addEventListener('pointermove', (e) => {
      if (!start) return;
      const dx = e.clientX - start.px, dy = e.clientY - start.py;
      if (!moved && Math.hypot(dx, dy) < 6) return;
      moved = true;
      fab.classList.add('dragging');
      place(start.x + dx, start.y + dy);
    });
    fab.addEventListener('pointerup', () => {
      if (!start) return;
      fab.classList.remove('dragging');
      if (moved) {
        const r = size();
        try { localStorage.setItem(KEY, JSON.stringify({ x: r.left / innerWidth, y: r.top / innerHeight })); } catch {}
      } else onClick && onClick();
      start = null;
    });
    fab.addEventListener('pointercancel', () => { start = null; fab.classList.remove('dragging'); });
    fab.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick && onClick(); } });

    let tipShown = false;
    const showTip = () => {
      if (tipShown) return; tipShown = true;
      let seen = false;
      try { seen = localStorage.getItem('krd_fab_tip') === '1'; localStorage.setItem('krd_fab_tip', '1'); } catch {}
      if (seen) return;
      const tip = document.createElement('div');
      tip.className = 'fab-tip';
      tip.textContent = 'กดเพื่อสุ่ม · ลากไปวางตรงไหนก็ได้';
      document.body.appendChild(tip);
      const r = size();
      tip.style.left = Math.min(innerWidth - 248, Math.max(8, r.left + r.width / 2 - 120)) + 'px';
      tip.style.top = (r.top > 70 ? r.top - 60 : r.bottom + 10) + 'px';
      setTimeout(() => tip.remove(), 4500);
    };
    const show = (on) => { fab.classList.toggle('show', on); if (on) { restore(); showTip(); } };
    if (watch && 'IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => show(!en.isIntersecting), { threshold: 0.15 }).observe(watch);
    } else show(true);
    return fab;
  }

  /* ---------- Utilities ---------- */
  function qs(name) { return new URLSearchParams(location.search).get(name); }
  function getRestaurant(id) { return window.RESTAURANTS.find((r) => r.id === id); }
  function mapsLink(r) { return `https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}`; }
  function mapsEmbed(r) { return `https://maps.google.com/maps?q=${r.lat},${r.lng}&z=16&output=embed`; }
  function hoursText(r) {
    const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const d = r.closed.length ? `หยุดทุกวัน${r.closed.map((x) => days[x]).join('และ')}` : 'ร้านเปิดให้บริการทุกวัน';
    return `${d}<br>เวลาเปิด-ปิด : ${r.open.replace(':', '.')} - ${r.close.replace(':', '.')} น.`;
  }

  // ป้องกันหน้าที่ต้องล็อกอิน
  async function requireLogin() {
    const me = await KRD.api.getMe();
    if (!me) { location.href = 'login.html?next=' + encodeURIComponent(location.pathname.split('/').pop() + location.search); throw new Error('redirect'); }
    return me;
  }

  // อ่านไฟล์รูปแล้วย่อขนาด (ลดขนาดก่อนอัปโหลด) → Blob
  function resizeImage(file, max = 800) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        c.toBlob((b) => resolve(b), 'image/jpeg', 0.85);
        URL.revokeObjectURL(img.src);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /* ---------- ครอปรูปก่อนอัปโหลด ----------
     cropImage(file, { aspect: กว้าง/สูง, round: true = กรอบวงกลม, outW: ความกว้างไฟล์ที่ได้ })
     → Promise<Blob | null>  (null = ผู้ใช้กดยกเลิก)
     ลากเพื่อเลื่อนรูป · ซูมด้วยแถบเลื่อน / ล้อเมาส์ / สองนิ้วบนมือถือ */
  function cropImage(file, { aspect = 1, round = false, outW = 800, title = 'ปรับรูป' } = {}) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      let done = false;
      openModal({
        title, iconName: 'imageAdd',
        body: `
          <div class="crop-wrap">
            <div class="crop-stage ${round ? 'round' : ''}" style="aspect-ratio:${aspect}">
              <img class="crop-img" src="${url}" alt="" draggable="false">
              <div class="crop-frame"></div>
            </div>
            <p class="hint crop-hint">ลากเพื่อเลื่อนรูป · ใช้แถบด้านล่าง (หรือสองนิ้ว) เพื่อซูม</p>
            <div class="crop-zoom"><span class="z-small">${icon('image')}</span>
              <input type="range" min="1" max="4" step="0.01" value="1" aria-label="ซูม">
              <span class="z-big">${icon('image')}</span></div>
          </div>
          <div class="modal-actions" style="justify-content:center">
            <button class="btn" data-no>ยกเลิก</button><button class="btn btn-primary" data-ok>ใช้รูปนี้</button>
          </div>`,
        onMount(el, close) {
          const stage = el.querySelector('.crop-stage'), img = el.querySelector('.crop-img'), range = el.querySelector('input[type=range]');
          let W = 0, H = 0, base = 1, z = 1, x = 0, y = 0;
          const clampPos = () => {
            const s = base * z, iw = img.naturalWidth * s, ih = img.naturalHeight * s;
            x = Math.min(0, Math.max(W - iw, x)); y = Math.min(0, Math.max(H - ih, y));
          };
          const paint = () => { clampPos(); img.style.width = img.naturalWidth * base * z + 'px'; img.style.transform = `translate(${x}px, ${y}px)`; };
          const zoomTo = (nz, cx = W / 2, cy = H / 2) => {
            nz = Math.min(4, Math.max(1, nz));
            const k = nz / z; x = cx - (cx - x) * k; y = cy - (cy - y) * k; z = nz; range.value = z; paint();
          };
          const setup = () => {
            const r = stage.getBoundingClientRect(); W = r.width; H = r.height;
            base = Math.max(W / img.naturalWidth, H / img.naturalHeight);
            x = (W - img.naturalWidth * base * z) / 2; y = (H - img.naturalHeight * base * z) / 2; paint();
          };
          if (img.complete && img.naturalWidth) setup(); else img.onload = setup;
          img.onerror = () => { toast('เปิดไฟล์รูปนี้ไม่ได้', 'error'); close(); };

          // ลาก / สองนิ้วซูม
          const pts = new Map(); let last = null, pinch = null;
          stage.addEventListener('pointerdown', (e) => { stage.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); last = [e.clientX, e.clientY]; if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), z }; } });
          stage.addEventListener('pointermove', (e) => {
            if (!pts.has(e.pointerId)) return;
            pts.set(e.pointerId, [e.clientX, e.clientY]);
            if (pts.size === 2 && pinch) {
              const [a, b] = [...pts.values()], r = stage.getBoundingClientRect();
              zoomTo(pinch.z * Math.hypot(a[0] - b[0], a[1] - b[1]) / pinch.d, (a[0] + b[0]) / 2 - r.left, (a[1] + b[1]) / 2 - r.top);
            } else if (pts.size === 1 && last) { x += e.clientX - last[0]; y += e.clientY - last[1]; last = [e.clientX, e.clientY]; paint(); }
          });
          const up = (e) => { pts.delete(e.pointerId); pinch = null; const v = [...pts.values()][0]; last = v ? [...v] : null; };
          stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
          stage.addEventListener('wheel', (e) => { e.preventDefault(); const r = stage.getBoundingClientRect(); zoomTo(z * (e.deltaY < 0 ? 1.08 : 0.93), e.clientX - r.left, e.clientY - r.top); }, { passive: false });
          range.addEventListener('input', () => zoomTo(+range.value));

          el.querySelector('[data-no]').onclick = close;
          el.querySelector('[data-ok]').onclick = () => {
            const s = base * z, outH = Math.round(outW / aspect);
            const c = document.createElement('canvas'); c.width = outW; c.height = outH;
            const ctx = c.getContext('2d'); ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, -x / s, -y / s, W / s, H / s, 0, 0, outW, outH);
            c.toBlob((b) => { done = true; resolve(b); close(); }, 'image/jpeg', 0.88);
          };
        },
        onClose() { URL.revokeObjectURL(url); if (!done) resolve(null); },
      });
    });
  }

  /* ---------- ช่องรหัสผ่าน + ปุ่มเปิด/ปิดตา (ใช้ทุกที่ที่กรอกรหัสผ่าน) ---------- */
  function pwField(name, placeholder, autocomplete = 'current-password') {
    return `<div class="field"><div class="pw-wrap">
        <input class="input" type="password" name="${name}" placeholder="${esc(placeholder)}" autocomplete="${autocomplete}">
        <button type="button" class="toggle-pw" aria-label="แสดงรหัสผ่าน">${icon('eye')}</button>
      </div></div>`;
  }
  function bindPwToggles(root = document) {
    root.querySelectorAll('.toggle-pw').forEach((b) => {
      if (b.dataset.bound) return; b.dataset.bound = 1;
      b.addEventListener('click', () => {
        const inp = b.parentElement.querySelector('input');
        const show = inp.type === 'password';
        inp.type = show ? 'text' : 'password';
        b.innerHTML = icon(show ? 'eyeOff' : 'eye');
        b.setAttribute('aria-label', show ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน');
      });
    });
  }

  // เรียกตอนเริ่มทุกหน้า: วาด header/footer และคืนค่าผู้ใช้ปัจจุบัน
  async function boot(active, opts = {}) {
    let me = null;
    try { me = await KRD.api.getMe(); } catch (e) { console.warn(e); }
    renderHeader(active, Object.assign({ me }, opts));
    renderFooter();
    return me;
  }

  window.KRD = Object.assign(window.KRD || {}, {
    boot, pwField, bindPwToggles,
    icon, diceSVG, esc, logoHTML, renderHeader, renderFooter, toast, openModal, confirmModal,
    avatarHTML, mbtiBadge, rImg, imgFail, assetImg, featIcons, restaurantCard, bindFavButtons, diceRoll, fabDice,
    qs, getRestaurant, mapsLink, mapsEmbed, hoursText, requireLogin, resizeImage, cropImage,
  });
})();
