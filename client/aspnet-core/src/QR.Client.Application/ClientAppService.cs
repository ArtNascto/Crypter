using System;
using System.Collections.Generic;
using System.Text;
using QR.Client.Localization;
using Volo.Abp.Application.Services;

namespace QR.Client;

/* Inherit your application services from this class.
 */
public abstract class ClientAppService : ApplicationService
{
    protected ClientAppService()
    {
        LocalizationResource = typeof(ClientResource);
    }
}
