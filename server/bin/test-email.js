'use strict';

var sendinblue = require('sendinblue-api');
var sendinBlueApiKey = require('../../config').sendinBlueApiKey;

var template = '';
template += '<!DOCTYPE html>';
template +=
  '<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">';
template += '<head>';
template += '    <meta charset="utf-8"> <!-- utf-8 works for most cases -->';
template +=
  '    <meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn\'t be necessary -->';
template +=
  '    <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->';
template +=
  '    <meta name="x-apple-disable-message-reformatting">  <!-- Disable auto-scale in iOS 10 Mail entirely -->';
template +=
  '    <title></title> <!-- The title tag shows in email notifications, like Android 4.4. -->';
template += '';
template += '    <!-- Web Font / @font-face : BEGIN -->';
template +=
  '    <!-- NOTE: If web fonts are not required, lines 10 - 27 can be safely removed. -->';
template += '';
template +=
  '    <!-- Desktop Outlook chokes on web font references and defaults to Times New Roman, so we force a safe fallback font. -->';
template += '    <!--[if mso]>';
template += '        <style>';
template += '            * {';
template += '                font-family: sans-serif !important;';
template += '            }';
template += '        </style>';
template += '    <![endif]-->';
template += '';
template +=
  '    <!-- All other clients get the webfont reference; some will render the font and others will silently fail to the fallbacks. More on that here: http://stylecampaign.com/blog/2015/02/webfont-support-in-email/ -->';
template += '    <!--[if !mso]><!-->';
template +=
  "    <!-- insert web font reference, eg: <link href='https://fonts.googleapis.com/css?family=Roboto:400,700' rel='stylesheet' type='text/css'> -->";
template += '    <!--<![endif]-->';
template += '';
template += '    <!-- Web Font / @font-face : END -->';
template += '';
template += '    <!-- CSS Reset : BEGIN -->';
template += '    <style>';
template += '';
template +=
  '        /* What it does: Remove spaces around the email design added by some email clients. */';
template +=
  '        /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */';
template += '        html,';
template += '        body {';
template += '            margin: 0 auto !important;';
template += '            padding: 0 !important;';
template += '            height: 100% !important;';
template += '            width: 100% !important;';
template += '        }';
template += '';
template += '        /* What it does: Stops email clients resizing small text. */';
template += '        * {';
template += '            -ms-text-size-adjust: 100%;';
template += '            -webkit-text-size-adjust: 100%;';
template += '        }';
template += '';
template += '        /* What it does: Centers email on Android 4.4 */';
template += '        div[style*="margin: 16px 0"] {';
template += '            margin: 0 !important;';
template += '        }';
template += '';
template += '        /* What it does: Stops Outlook from adding extra spacing to tables. */';
template += '        table,';
template += '        td {';
template += '            mso-table-lspace: 0pt !important;';
template += '            mso-table-rspace: 0pt !important;';
template += '        }';
template += '';
template +=
  '        /* What it does: Fixes webkit padding issue. Fix for Yahoo mail table alignment bug. Applies table-layout to the first 2 tables then removes for anything nested deeper. */';
template += '        table {';
template += '            border-spacing: 0 !important;';
template += '            border-collapse: collapse !important;';
template += '            table-layout: fixed !important;';
template += '            margin: 0 auto !important;';
template += '        }';
template += '        table table table {';
template += '            table-layout: auto;';
template += '        }';
template += '';
template +=
  '        /* What it does: Uses a better rendering method when resizing images in IE. */';
template += '        img {';
template += '            -ms-interpolation-mode:bicubic;';
template += '        }';
template += '';
template +=
  '        /* What it does: A work-around for email clients meddling in triggered links. */';
template += '        *[x-apple-data-detectors],  /* iOS */';
template += '        .x-gmail-data-detectors,    /* Gmail */';
template += '        .x-gmail-data-detectors *,';
template += '        .aBn {';
template += '            border-bottom: 0 !important;';
template += '            cursor: default !important;';
template += '            color: inherit !important;';
template += '            text-decoration: none !important;';
template += '            font-size: inherit !important;';
template += '            font-family: inherit !important;';
template += '            font-weight: inherit !important;';
template += '            line-height: inherit !important;';
template += '        }';
template += '';
template +=
  '        /* What it does: Prevents Gmail from displaying an download button on large, non-linked images. */';
template += '        .a6S {';
template += '            display: none !important;';
template += '            opacity: 0.01 !important;';
template += '        }';
template += "        /* If the above doesn't work, add a .g-img class to any image in question. */";
template += '        img.g-img + div {';
template += '            display: none !important;';
template += '        }';
template += '';
template += '        /* What it does: Prevents underlining the button text in Windows 10 */';
template += '        .button-link {';
template += '            text-decoration: none !important;';
template += '        }';
template += '';
template +=
  '        /* What it does: Removes right gutter in Gmail iOS app: https://github.com/TedGoas/Cerberus/issues/89  */';
template +=
  "        /* Create one of these media queries for each additional viewport size you'd like to fix */";
template += '        /* Thanks to Eric Lepetit (@ericlepetitsf) for help troubleshooting */';
template +=
  '        @media only screen and (min-device-width: 375px) and (max-device-width: 413px) { /* iPhone 6 and 6+ */';
template += '            .email-container {';
template += '                min-width: 375px !important;';
template += '            }';
template += '        }';
template += '';
template += '     @media screen and (max-width: 480px) {';
template += '         /* What it does: Forces Gmail app to display email full width */';
template += '         u ~ div .email-container {';
template += '           min-width: 100vw;';
template += '         }';
template += '   }';
template += '';
template += '    </style>';
template += '    <!-- CSS Reset : END -->';
template += '';
template += '    <!-- Progressive Enhancements : BEGIN -->';
template += '    <style>';
template += '';
template += '    /* What it does: Hover styles for buttons */';
template += '    .button-td,';
template += '    .button-a {';
template += '        transition: all 100ms ease-in;';
template += '    }';
template += '    .button-td:hover,';
template += '    .button-a:hover {';
template += '        background: #555555 !important;';
template += '        border-color: #555555 !important;';
template += '    }';
template += '';
template += '    /* Media Queries */';
template += '    @media screen and (max-width: 600px) {';
template += '';
template += '        /* What it does: Adjust typography on small screens to improve readability */';
template += '        .email-container p {';
template += '            font-size: 17px !important;';
template += '        }';
template += '';
template += '    }';
template += '';
template += '    </style>';
template += '    <!-- Progressive Enhancements : END -->';
template += '';
template +=
  '    <!-- What it does: Makes background images in 72ppi Outlook render at correct size. -->';
template += '    <!--[if gte mso 9]>';
template += '    <xml>';
template += '        <o:OfficeDocumentSettings>';
template += '            <o:AllowPNG/>';
template += '            <o:PixelsPerInch>96</o:PixelsPerInch>';
template += '        </o:OfficeDocumentSettings>';
template += '    </xml>';
template += '    <![endif]-->';
template += '';
template += '</head>';
template +=
  '<body width="100%" bgcolor="#222222" style="margin: 0; mso-line-height-rule: exactly;">';
template += '    <center style="width: 100%; background: #222222; text-align: left;">';
template += '';
template += '        <!-- Visually Hidden Preheader Text : BEGIN -->';
template +=
  '        <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">';
template +=
  "            (Optional) This text will appear in the inbox preview, but not the email body. It can be used to supplement the email subject line or even summarize the email's contents. Extended text preheaders (~490 characters) seems like a better UX for anyone using a screenreader or voice-command apps like Siri to dictate the contents of an email. If this text is not included, email clients will automatically populate it using the text (including image alt text) at the start of the email's body.";
template += '        </div>';
template += '        <!-- Visually Hidden Preheader Text : END -->';
template += '';
template += '        <!--';
template += '            Set the email width. Defined in two places:';
template +=
  '            1. max-width for all clients except Desktop Windows Outlook, allowing the email to squish on narrow but never go wider than 600px.';
template += '            2. MSO tags for Desktop Windows Outlook enforce a 600px width.';
template += '        -->';
template += '        <div style="max-width: 600px; margin: auto;" class="email-container">';
template += '            <!--[if mso]>';
template +=
  '            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" align="center">';
template += '            <tr>';
template += '            <td>';
template += '            <![endif]-->';
template += '';
template += '            <!-- Email Header : BEGIN -->';
template +=
  '            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px;">';
template += '                <tr>';
template += '                    <td style="padding: 20px 0; text-align: center">';
template +=
  '                        <img src="http://placehold.it/200x50" width="200" height="50" alt="alt_text" border="0" style="height: auto; background: #dddddd; font-family: sans-serif; font-size: 15px; line-height: 140%; color: #555555;">';
template += '                    </td>';
template += '                </tr>';
template += '            </table>';
template += '            <!-- Email Header : END -->';
template += '';
template += '            <!-- Email Body : BEGIN -->';
template +=
  '            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px;">';
template += '';
template += '                <!-- Hero Image, Flush : BEGIN -->';
template += '                <tr>';
template += '                    <td bgcolor="#ffffff" align="center">';
template +=
  '                        <img src="http://placehold.it/1200x600" width="600" height="" alt="alt_text" border="0" align="center" style="width: 100%; max-width: 600px; height: auto; background: #dddddd; font-family: sans-serif; font-size: 15px; line-height: 140%; color: #555555; margin: auto;" class="g-img">';
template += '                    </td>';
template += '                </tr>';
template += '                <!-- Hero Image, Flush : END -->';
template += '';
template += '                <!-- 1 Column Text + Button : BEGIN -->';
template += '                <tr>';
template += '                    <td bgcolor="#ffffff">';
template +=
  '                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">';
template += '                            <tr>';
template +=
  '                                <td style="padding: 40px; font-family: sans-serif; font-size: 15px; line-height: 140%; color: #555555;">';
template +=
  '                                    <h1 style="margin: 0 0 10px 0; font-family: sans-serif; font-size: 24px; line-height: 125%; color: #333333; font-weight: normal;">Praesent laoreet malesuada&nbsp;cursus.</h1>';
template +=
  '                                    <p style="margin: 0;">Maecenas sed ante pellentesque, posuere leo id, eleifend dolor. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Praesent laoreet malesuada cursus. Maecenas scelerisque congue eros eu posuere. Praesent in felis ut velit pretium lobortis rhoncus ut&nbsp;erat.</p>';
template += '                                </td>';
template += '                            </tr>';
template += '                            <tr>';
template +=
  '                                <td style="padding: 0 40px; font-family: sans-serif; font-size: 15px; line-height: 140%; color: #555555;">';
template += '                                    <!-- Button : BEGIN -->';
template +=
  '                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: auto;">';
template += '                                        <tr>';
template +=
  '                                            <td style="border-radius: 3px; background: #222222; text-align: center;" class="button-td">';
template +=
  '                                                <a href="http://www.google.com" style="background: #222222; border: 15px solid #222222; font-family: sans-serif; font-size: 13px; line-height: 110%; text-align: center; text-decoration: none; display: block; border-radius: 3px; font-weight: bold;" class="button-a">';
template +=
  '                                                    <span style="color:#ffffff;" class="button-link">&nbsp;&nbsp;&nbsp;&nbsp;A Button&nbsp;&nbsp;&nbsp;&nbsp;</span>';
template += '                                                </a>';
template += '                                            </td>';
template += '                                        </tr>';
template += '                                    </table>';
template += '                                    <!-- Button : END -->';
template += '                                </td>';
template += '                            </tr>';
template += '                            <tr>';
template +=
  '                                <td style="padding: 40px; font-family: sans-serif; font-size: 15px; line-height: 140%; color: #555555;">';
template +=
  '                                    <h2 style="margin: 0 0 10px 0; font-family: sans-serif; font-size: 18px; line-height: 125%; color: #333333; font-weight: bold;">Praesent in felis ut velit pretium lobortis rhoncus ut&nbsp;erat.</h2>';
template +=
  '                                    <p style="margin: 0;">Maecenas sed ante pellentesque, posuere leo id, eleifend dolor. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Praesent laoreet malesuada cursus. Maecenas scelerisque congue eros eu posuere. Praesent in felis ut velit pretium lobortis rhoncus ut&nbsp;erat.</p>';
template += '                                </td>';
template += '                            </tr>';
template += '                        </table>';
template += '                    </td>';
template += '                </tr>';
template += '                <!-- 1 Column Text + Button : END -->';
template += '';
template += '                <!-- 2 Even Columns : BEGIN -->';
template += '                <tr>';
template +=
  '                    <td bgcolor="#ffffff" align="center" height="100%" valign="top" width="100%" style="padding-bottom: 40px">';
template +=
  '                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" width="100%" style="max-width:560px;">';
template += '                            <tr>';
template += '                                <td align="center" valign="top" width="50%">';
template +=
  '                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="font-size: 14px;text-align: left;">';
template += '                                        <tr>';
template +=
  '                                            <td style="text-align: center; padding: 0 10px;">';
template +=
  '                                                <img src="http://placehold.it/200" width="200" height="" alt="alt_text" border="0" align="center" style="width: 100%; max-width: 200px; background: #dddddd; font-family: sans-serif; font-size: 15px; line-height: 140%; color: #555555;">';
template += '                                            </td>';
template += '                                        </tr>';
template += '                                        <tr>';
template +=
  '                                            <td style="text-align: center;font-family: sans-serif; font-size: 15px; line-height: 140%; color: #555555; padding: 10px 10px 0;" class="stack-column-center">';
template +=
  '                                                <p style="margin: 0;">Maecenas sed ante pellentesque, posuere leo id, eleifend dolor. Class aptent taciti sociosqu ad litora per conubia nostra, per torquent inceptos&nbsp;himenaeos.</p>';
template += '                                            </td>';
template += '                                        </tr>';
template += '                                    </table>';
template += '                                </td>';
template += '                                <td align="center" valign="top" width="50%">';
template +=
  '                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="font-size: 14px;text-align: left;">';
template += '                                        <tr>';
template +=
  '                                            <td style="text-align: center; padding: 0 10px;">';
template +=
  '                                                <img src="http://placehold.it/200" width="200" height="" alt="alt_text" border="0" align="center" style="width: 100%; max-width: 200px; background: #dddddd; font-family: sans-serif; font-size: 15px; line-height: 140%; color: #555555;">';
template += '                                            </td>';
template += '                                        </tr>';
template += '                                        <tr>';
template +=
  '                                            <td style="text-align: center;font-family: sans-serif; font-size: 15px; line-height: 140%; color: #555555; padding: 10px 10px 0;" class="stack-column-center">';
template +=
  '                                                <p style="margin: 0;">Maecenas sed ante pellentesque, posuere leo id, eleifend dolor. Class aptent taciti sociosqu ad litora per conubia nostra, per torquent inceptos&nbsp;himenaeos.</p>';
template += '                                            </td>';
template += '                                        </tr>';
template += '                                    </table>';
template += '                                </td>';
template += '                            </tr>';
template += '                        </table>';
template += '                    </td>';
template += '                </tr>';
template += '                <!-- Two Even Columns : END -->';
template += '';
template += '                <!-- Clear Spacer : BEGIN -->';
template += '                <tr>';
template +=
  '                    <td aria-hidden="true" height="40" style="font-size: 0; line-height: 0;">';
template += '                        &nbsp;';
template += '                    </td>';
template += '                </tr>';
template += '                <!-- Clear Spacer : END -->';
template += '';
template += '                <!-- 1 Column Text : BEGIN -->';
template += '                <tr>';
template += '                    <td bgcolor="#ffffff">';
template +=
  '                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">';
template += '                            <tr>';
template +=
  '                                <td style="padding: 40px; font-family: sans-serif; font-size: 15px; line-height: 140%; color: #555555;">';
template +=
  '                                    <p style="margin: 0;">Maecenas sed ante pellentesque, posuere leo id, eleifend dolor. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Praesent laoreet malesuada cursus. Maecenas scelerisque congue eros eu posuere. Praesent in felis ut velit pretium lobortis rhoncus ut&nbsp;erat.</p>';
template += '                                </td>';
template += '                            </tr>';
template += '                        </table>';
template += '                    </td>';
template += '                </tr>';
template += '                <!-- 1 Column Text : END -->';
template += '';
template += '            </table>';
template += '            <!-- Email Body : END -->';
template += '';
template += '            <!-- Email Footer : BEGIN -->';
template +=
  '            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 680px; font-family: sans-serif; color: #888888; font-size: 12px; line-height: 140%;">';
template += '                <tr>';
template +=
  '                    <td style="padding: 40px 10px; width: 100%; font-family: sans-serif; font-size: 12px; line-height: 140%; text-align: center; color: #888888;" class="x-gmail-data-detectors">';
template +=
  '                        <webversion style="color: #cccccc; text-decoration: underline; font-weight: bold;">View as a Web Page</webversion>';
template += '                        <br><br>';
template +=
  '                        Company Name<br>123 Fake Street, SpringField, OR, 97477 US<br>(123) 456-7890';
template += '                        <br><br>';
template +=
  '                        <unsubscribe style="color: #888888; text-decoration: underline;">unsubscribe</unsubscribe>';
template += '                    </td>';
template += '                </tr>';
template += '            </table>';
template += '            <!-- Email Footer : END -->';
template += '';
template += '            <!--[if mso]>';
template += '            </td>';
template += '            </tr>';
template += '            </table>';
template += '            <![endif]-->';
template += '        </div>';
template += '';
template += '        <!-- Full Bleed Background Section : BEGIN -->';
template +=
  '        <table role="presentation" bgcolor="#709f2b" cellspacing="0" cellpadding="0" border="0" align="center" width="100%">';
template += '            <tr>';
template += '                <td valign="top" align="center">';
template +=
  '                    <div style="max-width: 600px; margin: auto;" class="email-container">';
template += '                        <!--[if mso]>';
template +=
  '                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" align="center">';
template += '                        <tr>';
template += '                        <td>';
template += '                        <![endif]-->';
template +=
  '                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">';
template += '                            <tr>';
template +=
  '                                <td style="padding: 40px; text-align: left; font-family: sans-serif; font-size: 15px; line-height: 140%; color: #ffffff;">';
template +=
  '                                    <p style="margin: 0;">Maecenas sed ante pellentesque, posuere leo id, eleifend dolor. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Praesent laoreet malesuada cursus. Maecenas scelerisque congue eros eu posuere. Praesent in felis ut velit pretium lobortis rhoncus ut&nbsp;erat.</p>';
template += '                                </td>';
template += '                            </tr>';
template += '                        </table>';
template += '                        <!--[if mso]>';
template += '                        </td>';
template += '                        </tr>';
template += '                        </table>';
template += '                        <![endif]-->';
template += '                    </div>';
template += '                </td>';
template += '            </tr>';
template += '        </table>';
template += '        <!-- Full Bleed Background Section : END -->';
template += '';
template += '    </center>';
template += '</body>';
template += '</html>';

var parameters = { apiKey: sendinBlueApiKey, timeout: 5000 };
var sendinObj = new sendinblue(parameters);

var input = {
  to: { ['natasha@mysoundwise.com']: '' },
  from: ['support@mysoundwise.com', 'Soundwise'],
  subject: 'test email',
  html: template,
};

sendinObj.send_email(input, function(err, response) {
  if (err) {
    console.log('email error: ', err);
    Promise.reject(err);
  } else {
    // console.log('email sent to: ', invitee);
    return response;
  }
});
