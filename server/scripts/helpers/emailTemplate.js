'use strict';

module.exports.emailTemplate = (publisherName, publisherImage, emailBody) => {
  var emailShell = '';
  emailShell += '<!DOCTYPE html>';
  emailShell +=
    '<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">';
  emailShell += '<head>';
  emailShell += '    <meta charset="utf-8"> <!-- utf-8 works for most cases -->';
  emailShell +=
    '    <meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn\'t be necessary -->';
  emailShell +=
    '    <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->';
  emailShell +=
    '    <meta name="x-apple-disable-message-reformatting">  <!-- Disable auto-scale in iOS 10 Mail entirely -->';
  emailShell +=
    '    <title></title> <!-- The title tag shows in email notifications, like Android 4.4. -->';
  emailShell += '';
  emailShell += '    <!-- Web Font / @font-face : BEGIN -->';
  emailShell +=
    '    <!-- NOTE: If web fonts are not required, lines 10 - 27 can be safely removed. -->';
  emailShell += '';
  emailShell +=
    '    <!-- Desktop Outlook chokes on web font references and defaults to Times New Roman, so we force a safe fallback font. -->';
  emailShell += '    <!--[if mso]>';
  emailShell += '        <style>';
  emailShell += '            * {';
  emailShell += '                font-family: sans-serif !important;';
  emailShell += '            }';
  emailShell += '        </style>';
  emailShell += '    <![endif]-->';
  emailShell += '';
  emailShell +=
    '    <!-- All other clients get the webfont reference; some will render the font and others will silently fail to the fallbacks. More on that here: http://stylecampaign.com/blog/2015/02/webfont-support-in-email/ -->';
  emailShell += '    <!--[if !mso]><!-->';
  emailShell +=
    "    <!-- insert web font reference, eg: <link href='https://fonts.googleapis.com/css?family=Roboto:400,700' rel='stylesheet' type='text/css'> -->";
  emailShell += '    <!--<![endif]-->';
  emailShell += '';
  emailShell += '    <!-- Web Font / @font-face : END -->';
  emailShell += '';
  emailShell += '    <!-- CSS Reset : BEGIN -->';
  emailShell += '    <style>';
  emailShell += '';
  emailShell +=
    '        /* What it does: Remove spaces around the email design added by some email clients. */';
  emailShell +=
    '        /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */';
  emailShell += '        html,';
  emailShell += '        body {';
  emailShell += '            margin: 0 auto !important;';
  emailShell += '            padding: 0 !important;';
  emailShell += '            height: 100% !important;';
  emailShell += '            width: 100% !important;';
  emailShell += '        }';
  emailShell += '';
  emailShell += '        /* What it does: Stops email clients resizing small text. */';
  emailShell += '        * {';
  emailShell += '            -ms-text-size-adjust: 100%;';
  emailShell += '            -webkit-text-size-adjust: 100%;';
  emailShell += '        }';
  emailShell += '';
  emailShell += '        /* What it does: Centers email on Android 4.4 */';
  emailShell += '        div[style*="margin: 16px 0"] {';
  emailShell += '            margin: 0 !important;';
  emailShell += '        }';
  emailShell += '';
  emailShell += '        /* What it does: Stops Outlook from adding extra spacing to tables. */';
  emailShell += '        table,';
  emailShell += '        td {';
  emailShell += '            mso-table-lspace: 0pt !important;';
  emailShell += '            mso-table-rspace: 0pt !important;';
  emailShell += '        }';
  emailShell += '';
  emailShell += '        h1 {';
  emailShell += '            margin: 0 0 10px 0;';
  emailShell += '            font-family: sans-serif;';
  emailShell += '            font-size: 24px;';
  emailShell += '            line-height: 125%;';
  emailShell += '            color: #333333;';
  emailShell += '            font-weight: normal;';
  emailShell += '        }';
  emailShell += '';
  emailShell += '        p {';
  emailShell += '            margin: 0 0 1em;';
  emailShell += '        }';
  emailShell += '';
  emailShell += '        div {';
  emailShell += '            margin: 0 0 1em;';
  emailShell += '        }';
  emailShell += '';
  emailShell +=
    '        /* What it does: Fixes webkit padding issue. Fix for Yahoo mail table alignment bug. Applies table-layout to the first 2 tables then removes for anything nested deeper. */';
  emailShell += '        table {';
  emailShell += '            border-spacing: 0 !important;';
  emailShell += '            border-collapse: collapse !important;';
  emailShell += '            table-layout: fixed !important;';
  emailShell += '            margin: 0 auto !important;';
  emailShell += '        }';
  emailShell += '        table table table {';
  emailShell += '            table-layout: auto;';
  emailShell += '        }';
  emailShell += '';
  emailShell +=
    '        /* What it does: Uses a better rendering method when resizing images in IE. */';
  emailShell += '        img {';
  emailShell += '            -ms-interpolation-mode:bicubic;';
  emailShell += '        }';
  emailShell += '';
  emailShell +=
    '        /* What it does: A work-around for email clients meddling in triggered links. */';
  emailShell += '        *[x-apple-data-detectors],  /* iOS */';
  emailShell += '        .x-gmail-data-detectors,    /* Gmail */';
  emailShell += '        .x-gmail-data-detectors *,';
  emailShell += '        .aBn {';
  emailShell += '            border-bottom: 0 !important;';
  emailShell += '            cursor: default !important;';
  emailShell += '            color: inherit !important;';
  emailShell += '            text-decoration: none !important;';
  emailShell += '            font-size: inherit !important;';
  emailShell += '            font-family: inherit !important;';
  emailShell += '            font-weight: inherit !important;';
  emailShell += '            line-height: inherit !important;';
  emailShell += '        }';
  emailShell += '';
  emailShell +=
    '        /* What it does: Prevents Gmail from displaying an download button on large, non-linked images. */';
  emailShell += '        .a6S {';
  emailShell += '            display: none !important;';
  emailShell += '            opacity: 0.01 !important;';
  emailShell += '        }';
  emailShell +=
    "        /* If the above doesn't work, add a .g-img class to any image in question. */";
  emailShell += '        img.g-img + div {';
  emailShell += '            display: none !important;';
  emailShell += '        }';
  emailShell += '';
  emailShell += '        /* What it does: Prevents underlining the button text in Windows 10 */';
  emailShell += '        .button-link {';
  emailShell += '            text-decoration: none !important;';
  emailShell += '        }';
  emailShell += '';
  emailShell +=
    '        /* What it does: Removes right gutter in Gmail iOS app: https://github.com/TedGoas/Cerberus/issues/89  */';
  emailShell +=
    "        /* Create one of these media queries for each additional viewport size you'd like to fix */";
  emailShell += '        /* Thanks to Eric Lepetit (@ericlepetitsf) for help troubleshooting */';
  emailShell +=
    '        @media only screen and (min-device-width: 375px) and (max-device-width: 413px) { /* iPhone 6 and 6+ */';
  emailShell += '            .email-container {';
  emailShell += '                min-width: 375px !important;';
  emailShell += '            }';
  emailShell += '        }';
  emailShell += '';
  emailShell += '     @media screen and (max-width: 480px) {';
  emailShell += '         /* What it does: Forces Gmail app to display email full width */';
  emailShell += '         u ~ div .email-container {';
  emailShell += '           min-width: 100vw;';
  emailShell += '         }';
  emailShell += '   }';
  emailShell += '';
  emailShell += '    </style>';
  emailShell += '    <!-- CSS Reset : END -->';
  emailShell += '';
  emailShell += '    <!-- Progressive Enhancements : BEGIN -->';
  emailShell += '    <style>';
  emailShell += '';
  emailShell += '    /* What it does: Hover styles for buttons */';
  emailShell += '    .button-td,';
  emailShell += '    .button-a {';
  emailShell += '        transition: all 100ms ease-in;';
  emailShell += '    }';
  emailShell += '    .button-td:hover,';
  emailShell += '    .button-a:hover {';
  emailShell += '        background: #555555 !important;';
  emailShell += '        border-color: #555555 !important;';
  emailShell += '    }';
  emailShell += '';
  emailShell += '    /* Media Queries */';
  emailShell += '    @media screen and (max-width: 600px) {';
  emailShell += '';
  emailShell +=
    '        /* What it does: Adjust typography on small screens to improve readability */';
  emailShell += '        .email-container p {';
  emailShell += '            font-size: 17px !important;';
  emailShell += '        }';
  emailShell += '';
  emailShell += '    }';
  emailShell += '';
  emailShell += '    </style>';
  emailShell += '    <!-- Progressive Enhancements : END -->';
  emailShell += '';
  emailShell +=
    '    <!-- What it does: Makes background images in 72ppi Outlook render at correct size. -->';
  emailShell += '    <!--[if gte mso 9]>';
  emailShell += '    <xml>';
  emailShell += '        <o:OfficeDocumentSettings>';
  emailShell += '            <o:AllowPNG/>';
  emailShell += '            <o:PixelsPerInch>96</o:PixelsPerInch>';
  emailShell += '        </o:OfficeDocumentSettings>';
  emailShell += '    </xml>';
  emailShell += '    <![endif]-->';
  emailShell += '';
  emailShell += '</head>';
  emailShell +=
    '<body width="100%" bgcolor="#FFF8E1" style="margin: 0; mso-line-height-rule: exactly;">';
  emailShell += '    <center style="width: 100%; background: #FFF8E1; text-align: left;">';
  emailShell += '';
  emailShell += '        <!--';
  emailShell += '            Set the email width. Defined in two places:';
  emailShell +=
    '            1. max-width for all clients except Desktop Windows Outlook, allowing the email to squish on narrow but never go wider than 600px.';
  emailShell += '            2. MSO tags for Desktop Windows Outlook enforce a 600px width.';
  emailShell += '        -->';
  emailShell += '        <div style="max-width: 600px; margin: auto;" class="email-container">';
  emailShell += '            <!--[if mso]>';
  emailShell +=
    '            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" align="center">';
  emailShell += '            <tr>';
  emailShell += '            <td>';
  emailShell += '            <![endif]-->';
  emailShell += '';
  emailShell += '            <!-- Email Header : BEGIN -->';
  emailShell +=
    '            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px;">';
  emailShell += '                <tr>';
  emailShell += '                    <td style="padding: 20px 0; text-align: center; ">';
  emailShell += `                        <img src=\"${publisherImage}\" width=\"40\" height=\"40\" alt=\"alt_text\" border=\"0\" style=\"height: auto;  font-family: sans-serif; font-size: 15px; line-height: 140%; color: #555555; vertical-align:middle; border-radius: 50%; padding-bottom: 5px; padding-right: 3px;\">`;
  emailShell +=
    '                        <span style="margin: 0 0 10px 0; font-family: sans-serif; font-size: 22px; line-height: 140%; color: #333333; font-weight: normal; vertical-align:middle;">';
  emailShell += `${publisherName}`;
  emailShell += '                        </span>';
  emailShell += '                    </td>';
  emailShell += '                </tr>';
  emailShell += '            </table>';
  emailShell += '            <!-- Email Header : END -->';
  emailShell += '';
  emailShell += '            <!-- Email Body : BEGIN -->';
  emailShell +=
    '            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px;">';
  emailShell += '';
  emailShell += '                <!-- 1 Column Text + Button : BEGIN -->';
  emailShell += '                <tr>';
  emailShell += '                    <td bgcolor="#ffffff">';
  emailShell +=
    '                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" align="center">';
  emailShell += '                            <tr>';
  emailShell +=
    '                                <td style="padding: 40px 40px 0px 40px; font-family: sans-serif; font-size: 15px; line-height: 140%; color: #555555;">';
  emailShell += `${emailBody}`;
  emailShell += '                                </td>';
  emailShell += '                            </tr>';
  emailShell += '                        </table>';
  emailShell += '                    </td>';
  emailShell += '                </tr>';
  emailShell += '                <!-- 1 Column Text + Button : END -->';
  emailShell += '';
  emailShell += '                <!-- 1 Column Text : BEGIN -->';
  emailShell += '                <tr>';
  emailShell += '                    <td bgcolor="#ffffff">';
  emailShell +=
    '                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">';
  emailShell += '                            <tr>';
  emailShell +=
    '                                <td style="padding: 20px 40px 40px 40px; font-family: sans-serif; font-size: 15px; line-height: 140%; color: #555555; text-align: center;">';
  emailShell +=
    '                                    <h2 style="margin: 0 0 10px 0; font-family: sans-serif; font-size: 18px; line-height: 125%; color: #333333; font-weight: bold;">To listen to your soundcast:</h2>';
  emailShell +=
    '                                    <h2 style="margin: 0 0 10px 0; font-family: sans-serif; font-size: 18px; line-height: 125%; color: #333333; font-weight: bold;">Open this email from your phone. Tap on a badge below to download the Soundwise app</h2>';
  emailShell +=
    '                                    <p style="margin: 0;">And don\'t forget to enable push notification to receive updates from your host!</p>';
  emailShell += '                                </td>';
  emailShell += '                            </tr>';
  emailShell += '                        </table>';
  emailShell += '                    </td>';
  emailShell += '                </tr>';
  emailShell += '                <!-- 1 Column Text : END -->';
  emailShell += '';
  emailShell += '                <!-- 2 Even Columns : BEGIN -->';
  emailShell += '                <tr>';
  emailShell +=
    '                    <td bgcolor="#ffffff" align="center" height="100%" valign="top" width="100%" style="padding-bottom: 40px">';
  emailShell +=
    '                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" width="100%" style="max-width:560px;">';
  emailShell += '                            <tr>';
  emailShell += '                                <td align="center" valign="top" width="50%">';
  emailShell +=
    '                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="font-size: 14px;text-align: left;">';
  emailShell += '                                        <tr>';
  emailShell +=
    '                                            <td style="text-align: center; padding: 0 10px;">';
  emailShell +=
    '                                                <a href="https://itunes.apple.com/us/app/soundwise-learn-on-the-go/id1290299134?ls=1&mt=8">';
  emailShell +=
    '                                                    <img src="https://mysoundwise.com/images/app-store-badge.png" width="200" height="" alt="alt_text" border="0" align="center" style="width: 100%; max-width: 200px;  font-family: sans-serif; font-size: 15px; line-height: 140%; color: #555555;">';
  emailShell += '                                                </a>';
  emailShell += '                                            </td>';
  emailShell += '                                        </tr>';
  emailShell += '                                    </table>';
  emailShell += '                                </td>';
  emailShell += '                                <td align="center" valign="top" width="50%">';
  emailShell +=
    '                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="font-size: 14px;text-align: left;">';
  emailShell += '                                        <tr>';
  emailShell +=
    '                                            <td style="text-align: center; padding: 0 10px;">';
  emailShell +=
    '                                                <a href="https://play.google.com/store/apps/details?id=com.soundwisecms_mobile_android">';
  emailShell +=
    '                                                    <img src="https://mysoundwise.com/images/google-play-badge.png" width="200" height="" alt="alt_text" border="0" align="center" style="width: 100%; max-width: 200px;  font-family: sans-serif; font-size: 15px; line-height: 140%; color: #555555;">';
  emailShell += '                                                </a>';
  emailShell += '                                            </td>';
  emailShell += '                                        </tr>';
  emailShell += '                                    </table>';
  emailShell += '                                </td>';
  emailShell += '                            </tr>';
  emailShell += '                        </table>';
  emailShell += '                    </td>';
  emailShell += '                </tr>';
  emailShell += '                <!-- Two Even Columns : END -->';
  emailShell += '';
  emailShell += '            </table>';
  emailShell += '            <!-- Email Body : END -->';
  emailShell += '';
  emailShell += '            <!-- Email Footer : BEGIN -->';
  emailShell +=
    '            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 680px; font-family: sans-serif; color: #888888; font-size: 12px; line-height: 140%;">';
  emailShell += '                <tr>';
  emailShell +=
    '                    <td style="padding: 40px 10px; width: 100%; font-family: sans-serif; font-size: 12px; line-height: 140%; text-align: center; color: #888888;" class="x-gmail-data-detectors">';
  emailShell +=
    '                        <p style="color: #cccccc; text-decoration: underline; line-height: 140%;">You\'re getting this email because you have subscribed or have been invited to subscribe to an audio program on Soundwise. Thank you!</p>';
  emailShell += '                        <br>Powered by<br>';
  emailShell +=
    '                        <img src="https://d1jzcuf08rvzm.cloudfront.net/SOUNDWISE+LOGO+BLACK.png" width="70" height="" alt="Soundwise" border="0" align="center" style="width: 100%; max-width: 125px;  font-family: sans-serif; font-size: 15px; line-height: 140%; color: #555555; padding-top: 5px; padding-bottom: 5px;">';
  emailShell += '                        <br>2818 Connecticut Ave NW<br>Washington, DC, USA, 20008';
  emailShell += '                        <br><br>';
  // emailShell += "                        <a href=\"[UNSUBSCRIBE]\"><unsubscribe style=\"color: #888888; text-decoration: underline;\">unsubscribe<\/unsubscribe></a>";
  emailShell += '                    </td>';
  emailShell += '                </tr>';
  emailShell += '            </table>';
  emailShell += '            <!-- Email Footer : END -->';
  emailShell += '';
  emailShell += '            <!--[if mso]>';
  emailShell += '            </td>';
  emailShell += '            </tr>';
  emailShell += '            </table>';
  emailShell += '            <![endif]-->';
  emailShell += '        </div>';
  emailShell += '    </center>';
  emailShell += '</body>';
  emailShell += '</html>';
  return emailShell;
};
