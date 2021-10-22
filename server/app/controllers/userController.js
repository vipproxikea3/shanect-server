const User = require('../models/User');
const CodeLog = require('../models/CodeLog');
const bcrypt = require('bcrypt');
const gpc = require('generate-pincode');
const nodemailer = require('nodemailer');

const userController = {
    getMe: async (req, res) => {
        try {
            const user = req.user;

            if (!user) return res.status(400).json({ msg: 'User not found' });

            console.log(user.createdAt);
            var now = new Date();
            console.log(now);
            console.log((now.getTime() - user.createdAt.getTime()) / 1000);

            return res.json({ user });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    register: async (req, res) => {
        try {
            const { name, username, password } = req.body;

            let user = await User.findOne({ username });

            if (user)
                return res
                    .status(400)
                    .json({ msg: 'This email or username is exist' });

            const newUser = new User({
                name,
                username,
                password,
            });

            await newUser.save();

            return res.json({ user: newUser });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    login: async (req, res) => {
        try {
            const { username, password } = req.body;
            const user = await User.findOne({ username });
            if (!user) {
                return res
                    .status(400)
                    .json({ msg: 'Invalid login credentials' });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res
                    .status(400)
                    .json({ msg: 'Invalid login credentials' });
            }
            const token = await user.generateAuthToken();
            return res.json({
                user,
                token,
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    updateEmail: async (req, res) => {
        try {
            const { username, email, code } = req.body;
            let user = await User.findOne({ username });

            if (!user) {
                return res.status(400).json({ msg: 'User not found' });
            }

            let codeLog = await CodeLog.findOne({ email: email }).sort({
                createdAt: -1,
            });

            if (!codeLog) {
                return res.status(400).json({ msg: 'Verify Code not found' });
            }

            if (code !== codeLog.code) {
                return res.status(400).json({ msg: 'Verify Code incorrect' });
            }

            let now = new Date();

            if (now.getTime() - codeLog.createdAt.getTime() > 600000) {
                return res.status(400).json({ msg: 'Verify Code expired' });
            }

            user.email = email;

            await user.save();

            return res.json({ user });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    updatePassword: async (req, res) => {
        try {
            const { password } = req.body;
            let user = req.user;

            if (!user) {
                return res.status(400).json({ msg: 'User not found' });
            }

            user.password = password;

            await user.save();

            return res.json({ user });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    updateAvatar: async (req, res) => {
        try {
            let user = req.user;

            if (!user) {
                return res.status(400).json({ msg: 'User not found' });
            }

            if (req.file) user.avatar = req.file.path;

            await user.save();

            return res.json({ user });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    update: async (req, res) => {
        try {
            const { name, gender, yearOfBirth } = req.body;

            let user = req.user;

            if (!user) {
                return res.status(400).json({ msg: 'User not found' });
            }

            user.name = name;
            user.gender = gender;
            user.yearOfBirth = yearOfBirth;

            await user.save();

            return res.json({ user });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    resetPassword: async (req, res) => {
        try {
            const { username, code } = req.body;
            let user = await User.findOne({ username });
            if (!user) {
                return res.status(400).json({ msg: 'User not found' });
            }

            if (!user.email) {
                return res.status(400).json({ msg: 'Email of user not found' });
            }

            let codeLog = await CodeLog.findOne({ email: user.email }).sort({
                createdAt: -1,
            });

            if (!codeLog) {
                return res.status(400).json({ msg: 'Verify Code not found' });
            }

            if (code !== codeLog.code) {
                return res.status(400).json({ msg: 'Verify Code incorrect' });
            }

            let now = new Date();
            if (now.getTime() - codeLog.createdAt.getTime() > 600000) {
                return res.status(400).json({ msg: 'Verify Code expired' });
            }

            let pin = gpc(8);

            var transporter = nodemailer.createTransport({
                // config mail server
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: 'ShanectTeam@gmail.com',
                    pass: '0376277843',
                },
                tls: {
                    rejectUnauthorized: false,
                },
            });

            let content = '';

            content += `
            
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html
    xmlns="http://www.w3.org/1999/xhtml"
    xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office"
>
    <head>
        <!--[if gte mso 9]>
            <xml>
                <o:OfficeDocumentSettings>
                    <o:AllowPNG />
                    <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
            </xml>
        <![endif]-->
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="x-apple-disable-message-reformatting" />
        <!--[if !mso]><!-->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <!--<![endif]-->
        <title></title>

        <style type="text/css">
            table,
            td {
                color: #000000;
            }
            @media only screen and (min-width: 620px) {
                .u-row {
                    width: 600px !important;
                }
                .u-row .u-col {
                    vertical-align: top;
                }

                .u-row .u-col-100 {
                    width: 600px !important;
                }
            }

            @media (max-width: 620px) {
                .u-row-container {
                    max-width: 100% !important;
                    padding-left: 0px !important;
                    padding-right: 0px !important;
                }
                .u-row .u-col {
                    min-width: 320px !important;
                    max-width: 100% !important;
                    display: block !important;
                }
                .u-row {
                    width: calc(100% - 40px) !important;
                }
                .u-col {
                    width: 100% !important;
                }
                .u-col > div {
                    margin: 0 auto;
                }
            }
            body {
                margin: 0;
                padding: 0;
            }

            table,
            tr,
            td {
                vertical-align: top;
                border-collapse: collapse;
            }

            p {
                margin: 0;
            }

            .ie-container table,
            .mso-container table {
                table-layout: fixed;
            }

            * {
                line-height: inherit;
            }

            a[x-apple-data-detectors='true'] {
                color: inherit !important;
                text-decoration: none !important;
            }
        </style>

        <!--[if !mso]><!-->
        <link
            href="https://fonts.googleapis.com/css?family=Cabin:400,700&display=swap"
            rel="stylesheet"
            type="text/css"
        />
        <!--<![endif]-->
    </head>

    <body
        class="clean-body u_body"
        style="
            margin: 0;
            padding: 0;
            -webkit-text-size-adjust: 100%;
            background-color: #f9f9f9;
            color: #000000;
        "
    >
        <!--[if IE]><div class="ie-container"><![endif]-->
        <!--[if mso]><div class="mso-container"><![endif]-->
        <table
            style="
                border-collapse: collapse;
                table-layout: fixed;
                border-spacing: 0;
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
                vertical-align: top;
                min-width: 320px;
                margin: 0 auto;
                background-color: #f9f9f9;
                width: 100%;
            "
            cellpadding="0"
            cellspacing="0"
        >
            <tbody>
                <tr style="vertical-align: top">
                    <td
                        style="
                            word-break: break-word;
                            border-collapse: collapse !important;
                            vertical-align: top;
                        "
                    >
                        <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #f9f9f9;"><![endif]-->

                        <div
                            class="u-row-container"
                            style="padding: 0px; background-color: transparent"
                        >
                            <div
                                class="u-row"
                                style="
                                    margin: 0 auto;
                                    min-width: 320px;
                                    max-width: 600px;
                                    overflow-wrap: break-word;
                                    word-wrap: break-word;
                                    word-break: break-word;
                                    background-color: transparent;
                                "
                            >
                                <div
                                    style="
                                        border-collapse: collapse;
                                        display: table;
                                        width: 100%;
                                        background-color: transparent;
                                    "
                                >
                                    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->

                                    <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                                    <div
                                        class="u-col u-col-100"
                                        style="
                                            max-width: 320px;
                                            min-width: 600px;
                                            display: table-cell;
                                            vertical-align: top;
                                        "
                                    >
                                        <div style="width: 100% !important">
                                            <!--[if (!mso)&(!IE)]><!--><div
                                                style="
                                                    padding: 0px;
                                                    border-top: 0px solid
                                                        transparent;
                                                    border-left: 0px solid
                                                        transparent;
                                                    border-right: 0px solid
                                                        transparent;
                                                    border-bottom: 0px solid
                                                        transparent;
                                                "
                                            ><!--<![endif]-->
                                                <!--[if (!mso)&(!IE)]><!-->
                                            </div>
                                            <!--<![endif]-->
                                        </div>
                                    </div>
                                    <!--[if (mso)|(IE)]></td><![endif]-->
                                    <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                                </div>
                            </div>
                        </div>

                        <div
                            class="u-row-container"
                            style="padding: 0px; background-color: transparent"
                        >
                            <div
                                class="u-row"
                                style="
                                    margin: 0 auto;
                                    min-width: 320px;
                                    max-width: 600px;
                                    overflow-wrap: break-word;
                                    word-wrap: break-word;
                                    word-break: break-word;
                                    background-color: #003399;
                                "
                            >
                                <div
                                    style="
                                        border-collapse: collapse;
                                        display: table;
                                        width: 100%;
                                        background-color: transparent;
                                    "
                                >
                                    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #003399;"><![endif]-->

                                    <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                                    <div
                                        class="u-col u-col-100"
                                        style="
                                            max-width: 320px;
                                            min-width: 600px;
                                            display: table-cell;
                                            vertical-align: top;
                                        "
                                    >
                                        <div style="width: 100% !important">
                                            <!--[if (!mso)&(!IE)]><!--><div
                                                style="
                                                    padding: 0px;
                                                    border-top: 0px solid
                                                        transparent;
                                                    border-left: 0px solid
                                                        transparent;
                                                    border-right: 0px solid
                                                        transparent;
                                                    border-bottom: 0px solid
                                                        transparent;
                                                "
                                            ><!--<![endif]-->
                                                <table
                                                    style="
                                                        font-family: 'Cabin',
                                                            sans-serif;
                                                    "
                                                    role="presentation"
                                                    cellpadding="0"
                                                    cellspacing="0"
                                                    width="100%"
                                                    border="0"
                                                >
                                                    <tbody>
                                                        <tr>
                                                            <td
                                                                style="
                                                                    overflow-wrap: break-word;
                                                                    word-break: break-word;
                                                                    padding: 40px
                                                                        10px
                                                                        10px;
                                                                    font-family: 'Cabin',
                                                                        sans-serif;
                                                                "
                                                                align="left"
                                                            >
                                                                <table
                                                                    width="100%"
                                                                    cellpadding="0"
                                                                    cellspacing="0"
                                                                    border="0"
                                                                >
                                                                    <tr>
                                                                        <td
                                                                            style="
                                                                                padding-right: 0px;
                                                                                padding-left: 0px;
                                                                            "
                                                                            align="center"
                                                                        >
                                                                            <img
                                                                                align="center"
                                                                                border="0"
                                                                                src="https://res.cloudinary.com/shanectteam/image/upload/v1634286224/image-2_y36ylx.png"
                                                                                alt="Image"
                                                                                title="Image"
                                                                                style="
                                                                                    outline: none;
                                                                                    text-decoration: none;
                                                                                    -ms-interpolation-mode: bicubic;
                                                                                    clear: both;
                                                                                    display: inline-block !important;
                                                                                    border: none;
                                                                                    height: auto;
                                                                                    float: none;
                                                                                    width: 26%;
                                                                                    max-width: 150.8px;
                                                                                "
                                                                                width="150.8"
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>

                                                <table
                                                    style="
                                                        font-family: 'Cabin',
                                                            sans-serif;
                                                    "
                                                    role="presentation"
                                                    cellpadding="0"
                                                    cellspacing="0"
                                                    width="100%"
                                                    border="0"
                                                >
                                                    <tbody>
                                                        <tr>
                                                            <td
                                                                style="
                                                                    overflow-wrap: break-word;
                                                                    word-break: break-word;
                                                                    padding: 0px
                                                                        10px
                                                                        31px;
                                                                    font-family: 'Cabin',
                                                                        sans-serif;
                                                                "
                                                                align="left"
                                                            >
                                                                <div
                                                                    style="
                                                                        color: #e5eaf5;
                                                                        line-height: 140%;
                                                                        text-align: center;
                                                                        word-wrap: break-word;
                                                                    "
                                                                >
                                                                    <p
                                                                        style="
                                                                            font-size: 14px;
                                                                            line-height: 140%;
                                                                        "
                                                                    >
                                                                        <span
                                                                            style="
                                                                                font-size: 28px;
                                                                                line-height: 39.2px;
                                                                            "
                                                                            ><strong
                                                                                ><span
                                                                                    style="
                                                                                        line-height: 39.2px;
                                                                                        font-size: 28px;
                                                                                    "
                                                                                    >New
                                                                                    Password
                                                                                </span></strong
                                                                            ></span
                                                                        >
                                                                    </p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>

                                                <!--[if (!mso)&(!IE)]><!-->
                                            </div>
                                            <!--<![endif]-->
                                        </div>
                                    </div>
                                    <!--[if (mso)|(IE)]></td><![endif]-->
                                    <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                                </div>
                            </div>
                        </div>

                        <div
                            class="u-row-container"
                            style="padding: 0px; background-color: transparent"
                        >
                            <div
                                class="u-row"
                                style="
                                    margin: 0 auto;
                                    min-width: 320px;
                                    max-width: 600px;
                                    overflow-wrap: break-word;
                                    word-wrap: break-word;
                                    word-break: break-word;
                                    background-color: #ffffff;
                                "
                            >
                                <div
                                    style="
                                        border-collapse: collapse;
                                        display: table;
                                        width: 100%;
                                        background-color: transparent;
                                    "
                                >
                                    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]-->

                                    <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                                    <div
                                        class="u-col u-col-100"
                                        style="
                                            max-width: 320px;
                                            min-width: 600px;
                                            display: table-cell;
                                            vertical-align: top;
                                        "
                                    >
                                        <div style="width: 100% !important">
                                            <!--[if (!mso)&(!IE)]><!--><div
                                                style="
                                                    padding: 0px;
                                                    border-top: 0px solid
                                                        transparent;
                                                    border-left: 0px solid
                                                        transparent;
                                                    border-right: 0px solid
                                                        transparent;
                                                    border-bottom: 0px solid
                                                        transparent;
                                                "
                                            ><!--<![endif]-->
                                                <table
                                                    style="
                                                        font-family: 'Cabin',
                                                            sans-serif;
                                                    "
                                                    role="presentation"
                                                    cellpadding="0"
                                                    cellspacing="0"
                                                    width="100%"
                                                    border="0"
                                                >
                                                    <tbody>
                                                        <tr>
                                                            <td
                                                                style="
                                                                    overflow-wrap: break-word;
                                                                    word-break: break-word;
                                                                    padding: 33px
                                                                        55px;
                                                                    font-family: 'Cabin',
                                                                        sans-serif;
                                                                "
                                                                align="left"
                                                            >
                                                                <div
                                                                    style="
                                                                        line-height: 160%;
                                                                        text-align: center;
                                                                        word-wrap: break-word;
                                                                    "
                                                                >
                                                                    <p
                                                                        style="
                                                                            font-size: 14px;
                                                                            line-height: 160%;
                                                                        "
                                                                    >
                                                                        <span
                                                                            style="
                                                                                font-size: 22px;
                                                                                line-height: 35.2px;
                                                                            "
                                                                            >Hi,
                                                                        </span>
                                                                    </p>
                                                                    <p
                                                                        style="
                                                                            font-size: 14px;
                                                                            line-height: 160%;
                                                                        "
                                                                    >
                                                                        <span
                                                                            style="
                                                                                font-size: 18px;
                                                                                line-height: 28.8px;
                                                                            "
                                                                            >You're
                                                                            almost
                                                                            ready
                                                                            to
                                                                            get
                                                                            started.
                                                                            Please
                                                                            check
                                                                            on
                                                                            the
                                                                            new password
                                                                            below
                                                                            to
                                                                            sign in
                                                                            your
                                                                            account
                                                                            and
                                                                            enjoy
                                                                            services
                                                                            with
                                                                            us!</span
                                                                        >
                                                                    </p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>

                                                <table
                                                    style="
                                                        font-family: 'Cabin',
                                                            sans-serif;
                                                    "
                                                    role="presentation"
                                                    cellpadding="0"
                                                    cellspacing="0"
                                                    width="100%"
                                                    border="0"
                                                >
                                                    <tbody>
                                                        <tr>
                                                            <td
                                                                style="
                                                                    overflow-wrap: break-word;
                                                                    word-break: break-word;
                                                                    padding: 33px
                                                                        55px
                                                                        60px;
                                                                    font-family: 'Cabin',
                                                                        sans-serif;
                                                                "
                                                                align="left"
                                                            >
                                                                <div
                                                                    style="
                                                                        color: #3598db;
                                                                        line-height: 160%;
                                                                        text-align: center;
                                                                        word-wrap: break-word;
                                                                    "
                                                                >
                                                                    <p
                                                                        style="
                                                                            line-height: 160%;
                                                                            font-size: 14px;
                                                                        "
                                                                    >
                                                                        <strong
                                                                            ><span
                                                                                style="
                                                                                    font-size: 72px;
                                                                                    line-height: 115.2px;
                                                                                "
                                                                                >${pin}</span
                                                                            ></strong
                                                                        >
                                                                    </p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>

                                                <table
                                                    style="
                                                        font-family: 'Cabin',
                                                            sans-serif;
                                                    "
                                                    role="presentation"
                                                    cellpadding="0"
                                                    cellspacing="0"
                                                    width="100%"
                                                    border="0"
                                                >
                                                    <tbody>
                                                        <tr>
                                                            <td
                                                                style="
                                                                    overflow-wrap: break-word;
                                                                    word-break: break-word;
                                                                    padding: 33px
                                                                        55px
                                                                        60px;
                                                                    font-family: 'Cabin',
                                                                        sans-serif;
                                                                "
                                                                align="left"
                                                            >
                                                                <div
                                                                    style="
                                                                        line-height: 160%;
                                                                        text-align: center;
                                                                        word-wrap: break-word;
                                                                    "
                                                                >
                                                                    <p
                                                                        style="
                                                                            line-height: 160%;
                                                                            font-size: 14px;
                                                                        "
                                                                    >
                                                                        <span
                                                                            style="
                                                                                font-size: 18px;
                                                                                line-height: 28.8px;
                                                                            "
                                                                            >Thanks,</span
                                                                        >
                                                                    </p>
                                                                    <p
                                                                        style="
                                                                            line-height: 160%;
                                                                            font-size: 14px;
                                                                        "
                                                                    >
                                                                        <span
                                                                            style="
                                                                                font-size: 18px;
                                                                                line-height: 28.8px;
                                                                            "
                                                                            >Shanect
                                                                            Team</span
                                                                        >
                                                                    </p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>

                                                <!--[if (!mso)&(!IE)]><!-->
                                            </div>
                                            <!--<![endif]-->
                                        </div>
                                    </div>
                                    <!--[if (mso)|(IE)]></td><![endif]-->
                                    <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                                </div>
                            </div>
                        </div>

                        <div
                            class="u-row-container"
                            style="padding: 0px; background-color: transparent"
                        >
                            <div
                                class="u-row"
                                style="
                                    margin: 0 auto;
                                    min-width: 320px;
                                    max-width: 600px;
                                    overflow-wrap: break-word;
                                    word-wrap: break-word;
                                    word-break: break-word;
                                    background-color: #003399;
                                "
                            >
                                <div
                                    style="
                                        border-collapse: collapse;
                                        display: table;
                                        width: 100%;
                                        background-color: transparent;
                                    "
                                >
                                    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #003399;"><![endif]-->

                                    <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                                    <div
                                        class="u-col u-col-100"
                                        style="
                                            max-width: 320px;
                                            min-width: 600px;
                                            display: table-cell;
                                            vertical-align: top;
                                        "
                                    >
                                        <div style="width: 100% !important">
                                            <!--[if (!mso)&(!IE)]><!--><div
                                                style="
                                                    padding: 0px;
                                                    border-top: 0px solid
                                                        transparent;
                                                    border-left: 0px solid
                                                        transparent;
                                                    border-right: 0px solid
                                                        transparent;
                                                    border-bottom: 0px solid
                                                        transparent;
                                                "
                                            ><!--<![endif]-->
                                                <table
                                                    style="
                                                        font-family: 'Cabin',
                                                            sans-serif;
                                                    "
                                                    role="presentation"
                                                    cellpadding="0"
                                                    cellspacing="0"
                                                    width="100%"
                                                    border="0"
                                                >
                                                    <tbody>
                                                        <tr>
                                                            <td
                                                                style="
                                                                    overflow-wrap: break-word;
                                                                    word-break: break-word;
                                                                    padding: 10px;
                                                                    font-family: 'Cabin',
                                                                        sans-serif;
                                                                "
                                                                align="left"
                                                            >
                                                                <div
                                                                    style="
                                                                        color: #fafafa;
                                                                        line-height: 180%;
                                                                        text-align: center;
                                                                        word-wrap: break-word;
                                                                    "
                                                                >
                                                                    <p
                                                                        style="
                                                                            font-size: 14px;
                                                                            line-height: 180%;
                                                                        "
                                                                    >
                                                                        <span
                                                                            style="
                                                                                font-size: 16px;
                                                                                line-height: 28.8px;
                                                                            "
                                                                            >Copyrights
                                                                            &copy;
                                                                            Company
                                                                            All
                                                                            Rights
                                                                            Reserved</span
                                                                        >
                                                                    </p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>

                                                <!--[if (!mso)&(!IE)]><!-->
                                            </div>
                                            <!--<![endif]-->
                                        </div>
                                    </div>
                                    <!--[if (mso)|(IE)]></td><![endif]-->
                                    <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                                </div>
                            </div>
                        </div>

                        <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                    </td>
                </tr>
            </tbody>
        </table>
        <!--[if mso]></div><![endif]-->
        <!--[if IE]></div><![endif]-->
    </body>
</html>

            `;

            var mainOptions = {
                from: 'Shanect Team',
                to: user.email,
                subject: 'Reset password',
                text: 'Your text is here', //Thường thi mình không dùng cái này thay vào đó mình sử dụng html để dễ edit hơn
                html: content, //Nội dung html mình đã tạo trên kia :))
            };
            transporter.sendMail(mainOptions, function (err, info) {
                if (err) {
                    return res.status(500).json({ msg: err.message });
                } else {
                    user.password = pin;
                    user.save();
                    return res.status(200).json({ msg: 'success' });
                }
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
};

module.exports = userController;
