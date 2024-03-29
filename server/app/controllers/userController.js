const User = require('../models/User');
const CodeLog = require('../models/CodeLog');
const Post = require('../models/Post');
const FollowUser = require('../models/FollowUser');
const SaveAdvise = require('../models/SaveAdvise');
const bcrypt = require('bcrypt');
const gpc = require('generate-pincode');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

var cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'shanectteam',
    api_key: '662668157463451',
    api_secret: 'Xy0OfONXFogj_KoCXuHOKKfaetw',
});

const CLIENT_ID =
    '127746184739-mtd90vl8h27p5h4ngi9khj5lu70of7ne.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN =
    '1//04UlL-w4whsKdCgYIARAAGAQSNwF-L9Ir-WnFW7qAUUye7V1R31XZI5c86AhLNngEIrCoA4W-Oi79aM_KLVtwnxiNfDpWSPzAUUU';

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const userController = {
    getMe: async (req, res) => {
        try {
            const tmp = req.user;

            if (!tmp) return res.status(400).json({ msg: 'User not found' });

            let user = await User.findOne({ _id: tmp._id }).populate({
                path: 'advise',
                populate: [
                    {
                        path: 'categories',
                        model: 'Category',
                        select: 'name',
                    },
                ],
            });

            return res.json({ user });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getAll: async (req, res) => {
        try {
            const users = await User.find({ verified: true }).populate({
                path: 'advise',
                populate: [
                    {
                        path: 'categories',
                        model: 'Category',
                        select: 'name',
                    },
                ],
            });

            return res.json({ users });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getUserById: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findOne({ _id: id }).populate({
                path: 'advise',
                populate: [
                    {
                        path: 'categories',
                        model: 'Category',
                        select: 'name',
                    },
                ],
            });

            const me = req.user;
            if (me) {
                const followUser = await FollowUser.findOne({
                    user: me._id,
                    follow: user._id,
                });
                if (followUser) {
                    user.following = true;
                } else {
                    user.following = false;
                }

                const saveAdvise = await SaveAdvise.findOne({
                    user: me._id,
                    advise: user._id,
                });
                if (saveAdvise) {
                    user.saved = true;
                } else {
                    user.saved = false;
                }
            }

            return res.json({ user });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getPostsByUser: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findOne({ _id: id });

            if (!user) return res.status(400).json({ msg: 'User not found' });

            const posts = await Post.find({ user: user._id, status: true })
                .sort({ createdAt: 'desc' })
                .populate({
                    path: 'categories',
                    model: 'Category',
                    select: 'name',
                })
                .populate({
                    path: 'subCategories',
                    model: 'SubCategory',
                    select: 'name',
                })
                .populate({
                    path: 'areas',
                    populate: [
                        {
                            path: 'province',
                            model: 'Province',
                            select: 'name',
                        },
                    ],
                })
                .populate({
                    path: 'areas',
                    populate: [
                        {
                            path: 'district',
                            model: 'District',
                            select: 'name',
                        },
                    ],
                })
                .populate({
                    path: 'areas',
                    populate: [
                        {
                            path: 'ward',
                            model: 'Ward',
                            select: 'name',
                        },
                    ],
                });

            return res.json({ posts });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    register: async (req, res) => {
        try {
            const {
                name,
                username,
                email,
                dateOfBirth,
                monthOfBirth,
                yearOfBirth,
                password,
                gender,
            } = req.body;

            let user = await User.findOne({ username });

            if (user)
                return res
                    .status(400)
                    .json({ msg: 'This email or username is exist' });

            user = await User.findOne({ email });

            if (user)
                return res
                    .status(400)
                    .json({ msg: 'This email or username is exist' });

            const newUser = new User({
                name,
                username,
                password,
                email,
                dateOfBirth: {
                    date: dateOfBirth,
                    month: monthOfBirth,
                    year: yearOfBirth,
                },
                gender,
            });

            await newUser.save();

            const accessToken = await oAuth2Client.getAccessToken();

            var transporter = nodemailer.createTransport({
                // config mail server
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    type: 'OAuth2',
                    user: 'ShanectTeam@gmail.com',
                    clientId: CLIENT_ID,
                    clientSecret: CLIENT_SECRET,
                    refreshToken: REFRESH_TOKEN,
                    accessToken: accessToken,
                    // user: 'ShanectTeam@gmail.com',
                    // pass: '0376277843',
                },
                tls: {
                    rejectUnauthorized: false,
                },
            });

            let url =
                'shanect-server.herokuapp.com/api/users/verify?id=' +
                newUser._id;

            let content = '';

            content += `
                        <!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
            <head>
            <!--[if gte mso 9]>
            <xml>
              <o:OfficeDocumentSettings>
                <o:AllowPNG/>
                <o:PixelsPerInch>96</o:PixelsPerInch>
              </o:OfficeDocumentSettings>
            </xml>
            <![endif]-->
              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta name="x-apple-disable-message-reformatting">
              <!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]-->
              <title></title>

                <style type="text/css">
                  table, td { color: #000000; } a { color: #0000ee; text-decoration: underline; }
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

            <!--[if !mso]><!--><link href="https://fonts.googleapis.com/css?family=Cabin:400,700&display=swap" rel="stylesheet" type="text/css"><!--<![endif]-->

            </head>

            <body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #f9f9f9;color: #000000">
              <!--[if IE]><div class="ie-container"><![endif]-->
              <!--[if mso]><div class="mso-container"><![endif]-->
              <table style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #f9f9f9;width:100%" cellpadding="0" cellspacing="0">
              <tbody>
              <tr style="vertical-align: top">
                <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #f9f9f9;"><![endif]-->

            <div class="u-row-container" style="padding: 0px;background-color: transparent">
              <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
                <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->

            <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
            <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
              <div style="width: 100% !important;">
              <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->

              <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
              </div>
            </div>
            <!--[if (mso)|(IE)]></td><![endif]-->
                  <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                </div>
              </div>
            </div>

            <div class="u-row-container" style="padding: 0px;background-color: transparent">
              <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
                <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]-->

            <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
            <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
              <div style="width: 100% !important;">
              <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->

              <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
              </div>
            </div>
            <!--[if (mso)|(IE)]></td><![endif]-->
                  <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                </div>
              </div>
            </div>

            <div class="u-row-container" style="padding: 0px;background-color: transparent">
              <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #003399;">
                <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #003399;"><![endif]-->

            <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
            <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
              <div style="width: 100% !important;">
              <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->

            <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
              <tbody>
                <tr>
                  <td style="overflow-wrap:break-word;word-break:break-word;padding:40px 10px 10px;font-family:'Cabin',sans-serif;" align="left">

            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding-right: 0px;padding-left: 0px;" align="center">

                  <img align="center" border="0" src="https://res.cloudinary.com/shanectteam/image/upload/v1634286224/image-2_y36ylx.png" alt="Image" title="Image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 26%;max-width: 150.8px;" width="150.8"/>

                </td>
              </tr>
            </table>

                  </td>
                </tr>
              </tbody>
            </table>

            <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
              <tbody>
                <tr>
                  <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">

              <div style="color: #e5eaf5; line-height: 140%; text-align: center; word-wrap: break-word;">
                <p style="font-size: 14px; line-height: 140%;"><strong>T H A N K S&nbsp; &nbsp;F O R&nbsp; &nbsp;S I G N I N G&nbsp; &nbsp;U P !</strong></p>
              </div>

                  </td>
                </tr>
              </tbody>
            </table>

            <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
              <tbody>
                <tr>
                  <td style="overflow-wrap:break-word;word-break:break-word;padding:0px 10px 31px;font-family:'Cabin',sans-serif;" align="left">

              <div style="color: #e5eaf5; line-height: 140%; text-align: center; word-wrap: break-word;">
                <p style="font-size: 14px; line-height: 140%;"><span style="font-size: 28px; line-height: 39.2px;"><strong><span style="line-height: 39.2px; font-size: 28px;">Verify Your E-mail Address </span></strong></span></p>
              </div>

                  </td>
                </tr>
              </tbody>
            </table>

              <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
              </div>
            </div>
            <!--[if (mso)|(IE)]></td><![endif]-->
                  <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                </div>
              </div>
            </div>

            <div class="u-row-container" style="padding: 0px;background-color: transparent">
              <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
                <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]-->

            <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
            <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
              <div style="width: 100% !important;">
              <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->

            <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
              <tbody>
                <tr>
                  <td style="overflow-wrap:break-word;word-break:break-word;padding:33px 55px;font-family:'Cabin',sans-serif;" align="left">

              <div style="line-height: 160%; text-align: center; word-wrap: break-word;">
                <p style="font-size: 14px; line-height: 160%;"><span style="font-size: 22px; line-height: 35.2px;">Hi, </span></p>
            <p style="font-size: 14px; line-height: 160%;"><span style="font-size: 18px; line-height: 28.8px;">You're almost ready to get started. Please click on the button below to verify your email address and enjoy services with us! </span></p>
              </div>

                  </td>
                </tr>
              </tbody>
            </table>

            <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
              <tbody>
                <tr>
                  <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">

            <div align="center">
              <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing: 0; border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;font-family:'Cabin',sans-serif;"><tr><td style="font-family:'Cabin',sans-serif;" align="center"><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://www.google.com/" style="height:46px; v-text-anchor:middle; width:234px;" arcsize="8.5%" stroke="f" fillcolor="#ff6600"><w:anchorlock/><center style="color:#FFFFFF;font-family:'Cabin',sans-serif;"><![endif]-->
                <a href="${url}" target="_blank" style="box-sizing: border-box;display: inline-block;font-family:'Cabin',sans-serif;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #ff6600; border-radius: 4px;-webkit-border-radius: 4px; -moz-border-radius: 4px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;">
                  <span style="display:block;padding:14px 44px 13px;line-height:120%;"><span style="font-size: 16px; line-height: 19.2px;"><strong><span style="line-height: 19.2px; font-size: 16px;">VERIFY YOUR EMAIL</span></strong></span></span>
                </a>
              <!--[if mso]></center></v:roundrect></td></tr></table><![endif]-->
            </div>

                  </td>
                </tr>
              </tbody>
            </table>

              <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
              </div>
            </div>
            <!--[if (mso)|(IE)]></td><![endif]-->
                  <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                </div>
              </div>
            </div>

            <div class="u-row-container" style="padding: 0px;background-color: transparent">
              <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #e5eaf5;">
                <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #e5eaf5;"><![endif]-->

            <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
            <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
              <div style="width: 100% !important;">
              <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->

              <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
              </div>
            </div>
            <!--[if (mso)|(IE)]></td><![endif]-->
                  <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                </div>
              </div>
            </div>

            <div class="u-row-container" style="padding: 0px;background-color: transparent">
              <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #003399;">
                <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #003399;"><![endif]-->

            <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
            <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
              <div style="width: 100% !important;">
              <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->

            <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
              <tbody>
                <tr>
                  <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">

              <div style="color: #fafafa; line-height: 180%; text-align: center; word-wrap: break-word;">
                <p style="font-size: 14px; line-height: 180%;"><span style="font-size: 16px; line-height: 28.8px;">Copyrights &copy; Company All Rights Reserved</span></p>
              </div>

                  </td>
                </tr>
              </tbody>
            </table>

              <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
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
                to: newUser.email,
                subject: 'Verify Account',
                text: 'Your text is here',
                html: content,
            };
            transporter.sendMail(mainOptions, function (err, info) {
                if (err) {
                    return res.status(500).json({ msg: err.message });
                } else {
                    return res.status(200).json({ msg: 'success' });
                }
            });

            return res.json({ user: newUser });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    verifyUser: async (req, res) => {
        try {
            const { id } = req.query;

            let user = await User.findOne({ _id: id });

            if (!user) return res.status(400).json({ msg: 'User not found' });

            user.verified = true;

            await user.save();

            return res.json({ msg: 'verify success' });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    login: async (req, res) => {
        try {
            const { username, password } = req.body;
            let user = await User.findOne({ username });
            if (!user) {
                user = await User.findOne({ email: username });
            }
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

            if (!user.verified) {
                return res.status(400).json({ msg: 'Not verified yet' });
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
            const { email, code } = req.body;
            let user = req.user;

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

            if (req.file) {
                user.avatar = req.file.path;
            }

            await user.save();

            return res.json({ user });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    updateCover: async (req, res) => {
        try {
            let user = req.user;

            if (!user) {
                return res.status(400).json({ msg: 'User not found' });
            }

            if (req.file) user.cover = req.file.path;

            await user.save();

            return res.json({ user });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    update: async (req, res) => {
        try {
            const { name, dateOfBirth, monthOfBirth, yearOfBirth, gender } =
                req.body;

            let user = req.user;

            if (!user) {
                return res.status(400).json({ msg: 'User not found' });
            }

            if (name) user.name = name;
            if (gender) user.gender = gender;
            user.dateOfBirth = {
                date: dateOfBirth,
                month: monthOfBirth,
                year: yearOfBirth,
            };

            await user.save();

            return res.json({ user });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    updateAdviseLevel: async (req, res) => {
        try {
            const { level } = req.body;

            let user = req.user;

            if (!user) {
                return res.status(400).json({ msg: 'User not found' });
            }

            user.advise.level.value = level;

            if (level == 0) {
                user.advise.level.name = 'Không rõ';
            } else if (level == 1) {
                user.advise.level.name = 'Tiểu học';
            } else if (level == 2) {
                user.advise.level.name = 'Trung học cơ sở';
            } else if (level == 3) {
                user.advise.level.name = 'Trung học phổ thông';
            } else if (level == 4) {
                user.advise.level.name = 'Trung cấp';
            } else if (level == 5) {
                user.advise.level.name = 'Cao đẳng';
            } else if (level == 6) {
                user.advise.level.name = 'Đại học';
            } else if (level == 7) {
                user.advise.level.name = 'Thạc sĩ';
            } else if (level == 8) {
                user.advise.level.name = 'Tiến sĩ';
            } else if (level == 9) {
                user.advise.level.name = 'Phó giáo sư';
            } else if (level == 10) {
                user.advise.level.name = 'Giáo sư';
            }

            await user.save();

            user = await User.findOne({ _id: user._id }).populate({
                path: 'advise',
                populate: [
                    {
                        path: 'categories',
                        model: 'Category',
                        select: 'name',
                    },
                ],
            });

            return res.json({ user });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    updateAdviseCategories: async (req, res) => {
        try {
            const { categories } = req.body;

            let user = req.user;

            if (!user) {
                return res.status(400).json({ msg: 'User not found' });
            }

            user.advise.categories = categories;

            await user.save();

            user = await User.findOne({ _id: user._id }).populate({
                path: 'advise',
                populate: [
                    {
                        path: 'categories',
                        model: 'Category',
                        select: 'name',
                    },
                ],
            });

            return res.json({ user });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    updateAdviseDescription: async (req, res) => {
        try {
            const { description } = req.body;

            let user = req.user;

            if (!user) {
                return res.status(400).json({ msg: 'User not found' });
            }

            user.advise.description = description;

            await user.save();

            user = await User.findOne({ _id: user._id }).populate({
                path: 'advise',
                populate: [
                    {
                        path: 'categories',
                        model: 'Category',
                        select: 'name',
                    },
                ],
            });

            return res.json({ user });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    updateAdviseReady: async (req, res) => {
        try {
            const { ready } = req.body;

            let user = req.user;

            if (!user) {
                return res.status(400).json({ msg: 'User not found' });
            }

            user.advise.ready = ready;

            await user.save();

            user = await User.findOne({ _id: user._id }).populate({
                path: 'advise',
                populate: [
                    {
                        path: 'categories',
                        model: 'Category',
                        select: 'name',
                    },
                ],
            });

            return res.json({ user });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    updateAdviseImages: async (req, res) => {
        try {
            let user = req.user;

            if (!user) {
                return res.status(400).json({ msg: 'User not found' });
            }

            if (req.files) {
                const images = req.files.map((item) => {
                    return item.path;
                });
                user.advise.images = images;
            }

            await user.save();

            user = await User.findOne({ _id: user._id }).populate({
                path: 'advise',
                populate: [
                    {
                        path: 'categories',
                        model: 'Category',
                        select: 'name',
                    },
                ],
            });

            return res.json({ user });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    follow: async (req, res) => {
        try {
            const user = req.user;
            if (!user) return res.status(400).json({ msg: 'User not found' });

            const { id } = req.params;
            const follow = await User.findOne({ _id: id }).populate({
                path: 'advise',
                populate: [
                    {
                        path: 'categories',
                        model: 'Category',
                        select: 'name',
                    },
                ],
            });
            if (!follow)
                return res.status(400).json({ msg: 'Follower not found' });

            let followUser = await FollowUser.findOne({
                user: user._id,
                follow: follow._id,
            });

            if (!followUser) {
                const followUser = new FollowUser();
                followUser.user = user._id;
                followUser.follow = follow._id;
                await followUser.save();
                follow.following = true;
            } else {
                await followUser.delete();
                follow.following = false;
            }

            return res.json({ follow });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getMyFollowUser: async (req, res) => {
        try {
            const user = req.user;
            if (!user) return res.status(400).json({ msg: 'User not found' });

            let users = await User.find({}).populate({
                path: 'advise',
                populate: [
                    {
                        path: 'categories',
                        model: 'Category',
                        select: 'name',
                    },
                ],
            });

            const followUsers = await FollowUser.find({ user: user._id });

            users = users.filter((user) => {
                if (followUsers.find((item) => item.follow.equals(user._id)))
                    return true;
                return false;
            });

            return res.json({ users });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    save: async (req, res) => {
        try {
            const user = req.user;
            if (!user) return res.status(400).json({ msg: 'User not found' });

            const { id } = req.params;
            const advise = await User.findOne({ _id: id }).populate({
                path: 'advise',
                populate: [
                    {
                        path: 'categories',
                        model: 'Category',
                        select: 'name',
                    },
                ],
            });
            if (!advise)
                return res.status(400).json({ msg: 'Advise not found' });

            let saveAdvise = await SaveAdvise.findOne({
                user: user._id,
                advise: advise._id,
            });

            if (!saveAdvise) {
                const saveAdvise = new SaveAdvise();
                saveAdvise.user = user._id;
                saveAdvise.advise = advise._id;
                await saveAdvise.save();
                advise.saved = true;
            } else {
                await saveAdvise.delete();
                advise.saved = false;
            }

            return res.json({ advise });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getMySaveAdvise: async (req, res) => {
        try {
            const user = req.user;
            if (!user) return res.status(400).json({ msg: 'User not found' });

            let users = await User.find({}).populate({
                path: 'advise',
                populate: [
                    {
                        path: 'categories',
                        model: 'Category',
                        select: 'name',
                    },
                ],
            });

            const savedAdvises = await SaveAdvise.find({ user: user._id });

            users = users.filter((user) => {
                if (savedAdvises.find((item) => item.advise.equals(user._id)))
                    return true;
                return false;
            });

            return res.json({ users });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    resetPassword: async (req, res) => {
        try {
            const { username, code } = req.body;
            let user = await User.findOne({ username });

            if (!user) {
                user = await User.findOne({ email: username });
            }

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

            const accessToken = await oAuth2Client.getAccessToken();

            var transporter = nodemailer.createTransport({
                // config mail server
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    type: 'OAuth2',
                    user: 'ShanectTeam@gmail.com',
                    clientId: CLIENT_ID,
                    clientSecret: CLIENT_SECRET,
                    refreshToken: REFRESH_TOKEN,
                    accessToken: accessToken,
                    // user: 'ShanectTeam@gmail.com',
                    // pass: '0376277843',
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
