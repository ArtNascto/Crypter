using QR.Client.Localization;
using Volo.Abp.AspNetCore.Mvc;

namespace QR.Client.Controllers;

/* Inherit your controllers from this class.
 */
public abstract class ClientController : AbpControllerBase
{
    protected ClientController()
    {
        LocalizationResource = typeof(ClientResource);
    }
}
